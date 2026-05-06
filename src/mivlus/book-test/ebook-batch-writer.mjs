import 'dotenv/config'
import { parse } from 'path'
import { writeFileSync, unlinkSync, readFileSync, existsSync, createReadStream, createWriteStream } from 'fs'
import { createGunzip } from 'zlib'
import { pipeline } from 'stream/promises'
import { MilvusClient } from '@zilliz/milvus2-sdk-node'
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { FormData } from 'formdata-node'
import { fileFromPath } from 'formdata-node/file-from-path'
import { Blob } from 'node:buffer'

const COLLECTION_NAME = process.env.EBOOK_COLLECTION_NAME
const CHUNK_SIZE = 500 // 拆分到 500 个字符
const EPUB_FILE = './src/mivlus/book-test/天龙八部.epub'
const BOOK_NAME = parse(EPUB_FILE).name

// 初始化 Milvus 客户端
const client = new MilvusClient({
  address: 'localhost:19530',
})

/**
 * 获取阿里云临时文件上传凭证
 */
async function getUploadPolicy(modelName) {
  const response = await fetch(
    `https://dashscope.aliyuncs.com/api/v1/uploads?action=getPolicy&model=${modelName}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.EMBEDDING_API_KEY}`,
        'Content-Type': 'application/json',
      }
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`获取上传凭证失败: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return data.data
}

/**
 * 上传文件到阿里云临时存储
 */
async function uploadFileToOSS(policyData, filePath) {
  const fileName = parse(filePath).name
  const key = `${policyData.upload_dir}/${fileName}`

  // 使用 Node.js 原生方式创建表单数据
  const boundary = `----WebKitFormBoundary${Date.now()}`
  const CRLF = '\r\n'
  
  const formData = []
  
  // 添加表单字段
  const fields = {
    'OSSAccessKeyId': policyData.oss_access_key_id,
    'Signature': policyData.signature,
    'policy': policyData.policy,
    'x-oss-object-acl': policyData.x_oss_object_acl,
    'x-oss-forbid-overwrite': policyData.x_oss_forbid_overwrite,
    'key': key,
    'success_action_status': '200'
  }
  
  for (const [name, value] of Object.entries(fields)) {
    formData.push(`--${boundary}`)
    formData.push(`Content-Disposition: form-data; name="${name}"`)
    formData.push('')
    formData.push(value)
  }
  
  // 添加文件
  const fileContent = readFileSync(filePath)
  formData.push(`--${boundary}`)
  formData.push(`Content-Disposition: form-data; name="file"; filename="${fileName}"`)
  formData.push('Content-Type: text/plain')
  formData.push('')
  formData.push(fileContent.toString('utf-8'))
  
  // 结束边界
  formData.push(`--${boundary}--`)
  formData.push('')
  
  const body = formData.join(CRLF)
  
  // 发送 POST 请求
  const response = await fetch(policyData.upload_host, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: body,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`上传文件到 OSS 失败: ${response.status} ${errorText}`)
  }

  return `oss://${key}`
}

/**
 * 上传本地文件并获取临时 URL
 */
async function uploadFileAndGetUrl(filePath, modelName) {
  // 1. 获取上传凭证
  const policyData = await getUploadPolicy(modelName)
  
  // 2. 上传文件到 OSS
  const ossUrl = await uploadFileToOSS(policyData, filePath)
  
  return ossUrl
}

/**
 * 获取已插入的章节号
 */
async function getInsertedChapters(bookId) {
  try {
    const stats = await client.getCollectionStatistics({
      collection_name: COLLECTION_NAME,
    })
    
    if (stats.data?.row_count === 0) {
      return []
    }
    
    // 查询所有已插入的章节号
    const queryResult = await client.query({
      collection_name: COLLECTION_NAME,
      filter: `book_id == '${bookId}'`,
      output_fields: ['chapter_num'],
    })
    
    if (!queryResult.data || queryResult.data.length === 0) {
      return []
    }
    
    // 提取所有章节号并去重
    const chapterNums = [...new Set(queryResult.data.map(item => item.chapter_num))]
    return chapterNums.sort((a, b) => a - b)
  } catch (error) {
    console.error('获取已插入章节时出错:', error.message)
    return []
  }
}

/**
 * 将章节文本保存为临时文件，用于批处理 API
 */
function saveChapterAsTextFile(chapterTexts, chapterNum) {
  const fileName = `./temp_chapter_${chapterNum}.txt`
  const content = chapterTexts.join('\n')
  writeFileSync(fileName, content, 'utf-8')
  return fileName
}

/**
 * 调用阿里云批处理 embedding API
 */
async function createBatchEmbeddingTask(textFileUrl) {
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EMBEDDING_API_KEY}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
      'X-DashScope-OssResourceResolve': 'enable', // 必须添加此参数才能解析 oss:// URL
    },
    body: JSON.stringify({
      model: 'text-embedding-async-v2',
      input: {
        url: textFileUrl
      },
      parameters: {
        text_type: 'document'
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`创建批处理任务失败: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  
  if (data.code && data.code !== '200' && data.code !== '20000') {
    throw new Error(`批处理任务错误: ${data.message || data.code}`)
  }

  return data.output.task_id
}

/**
 * 查询批处理任务状态
 */
async function getBatchTaskStatus(taskId) {
  const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.EMBEDDING_API_KEY}`,
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`查询任务状态失败: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return data.output
}

/**
 * 等待批处理任务完成
 */
async function waitForBatchTask(taskId, maxWaitTime = 300000) {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    const status = await getBatchTaskStatus(taskId)
    
    if (status.task_status === 'SUCCEEDED') {
      return status.url
    } else if (status.task_status === 'FAILED') {
      throw new Error(`批处理任务失败: ${status.code} ${status.message}`)
    } else if (status.task_status === 'PENDING' || status.task_status === 'RUNNING') {
      console.log(`  任务状态: ${status.task_status}, 等待中...`)
      await new Promise(resolve => setTimeout(resolve, 5000)) // 等待 5 秒
    } else {
      throw new Error(`未知任务状态: ${status.task_status}`)
    }
  }
  
  throw new Error('批处理任务超时')
}

/**
 * 下载并解压批处理结果文件
 */
async function downloadAndExtractBatchResult(resultUrl) {
  const tempGzFile = './temp_batch_result.gz'
  const tempResultFile = './temp_batch_result.jsonl'
  
  // 下载结果文件
  console.log(`  下载结果文件: ${resultUrl}`)
  const response = await fetch(resultUrl)
  if (!response.ok) {
    throw new Error(`下载结果文件失败: ${response.status}`)
  }
  
  const buffer = await response.arrayBuffer()
  writeFileSync(tempGzFile, Buffer.from(buffer))
  
  // 解压文件
  console.log(`  解压结果文件...`)
  await pipeline(
    createReadStream(tempGzFile),
    createGunzip(),
    createWriteStream(tempResultFile)
  )
  
  // 读取并解析 JSONL 文件
  const resultContent = readFileSync(tempResultFile, 'utf-8')
  const lines = resultContent.trim().split('\n')
  
  console.log(`  解析 ${lines.length} 行 JSONL 数据`)
  
  const embeddings = []
  const errorLines = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    try {
      const parsed = JSON.parse(line)
      
      // 检查是否有错误信息
      if (parsed.code && parsed.code !== 200) {
        console.error(`  ❌ 第 ${i + 1} 行返回错误: ${parsed.code} - ${parsed.message}`)
        errorLines.push(i + 1)
        continue
      }
      
      // 检查 embedding 字段是否存在
      if (!parsed.embedding) {
        console.error(`  ❌ 第 ${i + 1} 行缺少 embedding 字段`)
        console.error(`     内容: ${JSON.stringify(parsed).substring(0, 200)}`)
        errorLines.push(i + 1)
        continue
      }
      
      embeddings.push(parsed.embedding)
    } catch (error) {
      console.error(`  ❌ 解析第 ${i + 1} 行失败:`, error.message)
      console.error(`     内容: ${line.substring(0, 200)}`)
      errorLines.push(i + 1)
    }
  }
  
  if (errorLines.length > 0) {
    console.warn(`  ⚠️  共 ${errorLines.length} 行解析失败: ${errorLines.join(', ')}`)
  }
  
  console.log(`  ✓ 成功解析 ${embeddings.length} 个向量`)
  
  if (embeddings.length === 0) {
    throw new Error(`所有行解析失败，无法继续处理`)
  }
  
  // 清理临时文件
  if (existsSync(tempGzFile)) unlinkSync(tempGzFile)
  if (existsSync(tempResultFile)) unlinkSync(tempResultFile)
  
  return embeddings
}

/**
 * 批量插入到 Milvus
 */
async function insertToMilvus(embeddings, chapterNum, chunks) {
  const insertData = embeddings.map((embedding, index) => ({
    id: `1_${chapterNum}_${index}`,
    book_id: '1',
    book_name: BOOK_NAME,
    chapter_num: chapterNum,
    index: index,
    content: chunks[index] || '', // 使用原始文本内容
    vector: embedding
  }))

  const insertResult = await client.insert({
    collection_name: COLLECTION_NAME,
    data: insertData,
  })

  return Number(insertResult.insert_cnt) || 0
}

/**
 * 主函数：使用批处理 API 处理剩余章节
 */
async function main() {
  try {
    console.log('='.repeat(80))
    console.log('电子书批处理嵌入程序（使用 text-embedding-async-v2）')
    console.log('='.repeat(80))

    // 连接 Milvus
    console.log('\n连接 Milvus...')
    await client.connectPromise
    console.log('✓ 已连接\n')

    // 加载 EPUB 文件
    console.log(`加载 EPUB 文件: ${EPUB_FILE}`)
    const loader = new EPubLoader(EPUB_FILE, { splitChapters: true })
    const documents = await loader.load()
    console.log(`✓ 加载完成，共 ${documents.length} 个章节\n`)

    // 获取已插入的章节
    const insertedChapters = await getInsertedChapters('1')
    if (insertedChapters.length > 0) {
      console.log(`已插入的章节: ${insertedChapters.join(', ')}`)
    }

    // 创建文本拆分器
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: 50,
    })

    let totalProcessed = 0
    let skippedCount = 0

    // 处理每个章节
    for (let chapterIndex = 0; chapterIndex < documents.length; chapterIndex++) {
      const chapterNum = chapterIndex + 1
      
      // 检查该章节是否已经插入
      if (insertedChapters.includes(chapterNum)) {
        console.log(`跳过第 ${chapterNum}/${documents.length} 章（已插入）`)
        skippedCount++
        continue
      }
      
      const chapter = documents[chapterIndex]
      const chapterContent = chapter.pageContent

      console.log(`处理第 ${chapterNum}/${documents.length} 章...`)

      // 拆分文本
      const chunks = await textSplitter.splitText(chapterContent)
      console.log(`  拆分为 ${chunks.length} 个片段`)

      if (chunks.length === 0) {
        console.log(`  跳过空章节\n`)
        continue
      }

      // 保存为临时文件
      const tempFile = saveChapterAsTextFile(chunks, chapterNum)
      console.log(`  临时文件: ${tempFile}`)

      try {
        // 上传文件到阿里云临时存储
        console.log(`  上传文件到阿里云临时存储...`)
        const fileUrl = await uploadFileAndGetUrl(tempFile, 'text-embedding-async-v2')
        console.log(`  ✓ 文件 URL: ${fileUrl}`)

        // 创建批处理任务
        console.log(`  创建批处理任务...`)
        const taskId = await createBatchEmbeddingTask(fileUrl)
        console.log(`  任务 ID: ${taskId}`)

        // 等待任务完成
        console.log(`  等待批处理任务完成...`)
        const resultUrl = await waitForBatchTask(taskId)
        console.log(`  ✓ 任务完成`)

        // 下载并解析结果
        console.log(`  下载并解析结果...`)
        const embeddings = await downloadAndExtractBatchResult(resultUrl)
        console.log(`  ✓ 获得 ${embeddings.length} 个向量`)

        // 插入到 Milvus
        console.log(`  插入到 Milvus...`)
        const insertedCount = await insertToMilvus(embeddings, chapterNum, chunks)
        console.log(`  ✓ 已插入 ${insertedCount} 条记录（累计: ${totalProcessed + insertedCount}）\n`)
        
        totalProcessed += insertedCount

      } catch (error) {
        console.error(`  ❌ 处理第 ${chapterNum} 章时出错:`, error.message)
        console.log(`  跳过该章节，继续处理下一章\n`)
      } finally {
        // 清理临时文件
        if (existsSync(tempFile)) {
          unlinkSync(tempFile)
        }
      }
    }

    console.log('\n' + '='.repeat(80))
    console.log('处理完成！')
    console.log(`总共处理: ${totalProcessed} 条记录`)
    console.log(`跳过已插入: ${skippedCount} 个章节`)
    console.log('='.repeat(80))
  } catch (error) {
    console.error('\n错误:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()