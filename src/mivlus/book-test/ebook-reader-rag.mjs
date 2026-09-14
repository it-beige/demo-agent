import { parse } from 'path'
import { MilvusClient, MetricType } from '@zilliz/milvus2-sdk-node'
import { embeddings } from '../../shared/model.mjs'

const COLLECTION_NAME = process.env.EBOOK_COLLECTION_NAME
const MILVUS_ADDRESS = process.env.MILVUS_ADDRESS ?? 'localhost:19530'
const TOP_K = parseInt(process.env.EBOOK_TOP_K) || 5
// 问题优先取命令行参数（与 ebook-writer.mjs 的 process.argv[2] 用法一致），便于批量试问
// 例：pnpm dev src/mivlus/book-test/ebook-reader-rag.mjs '乔峰在聚贤庄和哪些人交手？'
// const QUESTION = '鸠摩智会什么武功？'
const QUESTION = process.argv[2] ?? '这本书最强的三位是谁？为什么？名字列给我'
const LLM_TIMEOUT_MS = parseInt(process.env.LLM_TIMEOUT_MS) || 20000
const EPUB_FILE =
  process.env.EBOOK_EPUB_FILE ?? './src/mivlus/book-test/天龙八部.epub'
// 从文件名提取书名（去掉扩展名）
const BOOK_NAME = parse(EPUB_FILE).name

// BASE_URL 的约定是已包含 /v1（与 shared/model.mjs 里 ChatOpenAI 的用法一致），
// 直接拼 /v1/chat/completions 会得到 /v1/v1/...；这里兼容带与不带 /v1 两种写法
const NORMALIZED_BASE_URL = (process.env.BASE_URL ?? '').replace(/\/+$/, '')
const CHAT_COMPLETIONS_URL = /\/v\d+$/.test(NORMALIZED_BASE_URL)
  ? `${NORMALIZED_BASE_URL}/chat/completions`
  : `${NORMALIZED_BASE_URL}/v1/chat/completions`

// 使用简单的 fetch 包装器，避免 LangChain Responses API 的 bug
const model = {
  async invoke(prompt) {
    console.log('发起 fetch 请求到:', CHAT_COMPLETIONS_URL)
    console.log('使用模型:', process.env.MODEL)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS)

    try {
      const response = await fetch(CHAT_COMPLETIONS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.MODEL,
          temperature: 0,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Chat 请求失败: ${response.status} ${response.statusText}\n${errorText}`,
        )
      }

      const data = await response.json()
      console.log('收到响应，choices:', data.choices?.length)

      return {
        content: data.choices?.[0]?.message?.content ?? '',
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error(`请求超时（${LLM_TIMEOUT_MS / 1000}秒）`)
      }
      throw error
    }
  },
}

// 初始化 Milvus 客户端
const client = new MilvusClient({
  address: MILVUS_ADDRESS,
})

/**
 * 获取文本的向量嵌入
 */
async function getEmbedding(text) {
  const result = await embeddings.embedQuery(text)
  return result
}

/**
 * 从 Milvus 中检索相关的电子书内容
 */
async function retrieveRelevantContent(question, k = 3) {
  try {
    // 生成问题的向量
    const queryVector = await getEmbedding(question)

    // 在 Milvus 中搜索相似的内容
    const searchResult = await client.search({
      collection_name: COLLECTION_NAME,
      vector: queryVector,
      limit: k,
      metric_type: MetricType.COSINE,
      output_fields: ['id', 'book_id', 'chapter_num', 'index', 'content'],
    })

    return searchResult.results
  } catch (error) {
    console.error('检索内容时出错:', error.message)
    return []
  }
}

/**
 * 使用 RAG 回答关于本书的问题
 */
async function answerEbookQuestion(question, k = TOP_K) {
  try {
    console.log('='.repeat(80))
    console.log(`问题: ${question}`)
    console.log('='.repeat(80))

    // 1. 检索相关内容
    console.log('\n【检索相关内容】')
    const retrievedContent = await retrieveRelevantContent(question, k)

    if (retrievedContent.length === 0) {
      console.log('未找到相关内容')
      return `抱歉，我没有找到相关的《${BOOK_NAME}》内容。`
    }

    // 2. 打印检索到的内容及相似度
    retrievedContent.forEach((item, i) => {
      console.log(`\n[片段 ${i + 1}] 相似度: ${item.score.toFixed(4)}`)
      console.log(`书籍: ${item.book_id}`)
      console.log(`章节: 第 ${item.chapter_num} 章`)
      console.log(`片段索引: ${item.index}`)
      console.log(
        `内容: ${item.content.substring(0, 200)}${item.content.length > 200 ? '...' : ''}`,
      )
    })

    // 3. 构建上下文
    const context = retrievedContent
      .map((item, i) => {
        return `[片段 ${i + 1}]
章节: 第 ${item.chapter_num} 章
内容: ${item.content}`
      })
      .join('\n\n━━━━━\n\n')

    // 4. 构建 prompt
    const prompt = `你是一个专业的《${BOOK_NAME}》小说助手。基于小说内容回答问题，用准确、详细的语言。

请根据以下《${BOOK_NAME}》小说片段内容回答问题：
${context}

用户问题: ${question}

回答要求：
1. 如果片段中有相关信息，请结合小说内容给出详细、准确的回答
2. 可以综合多个片段的内容，提供完整的答案
3. 如果片段中没有相关信息，请如实告知用户
4. 回答要准确，符合小说的情节和人物设定
5. 可以引用原文内容来支持你的回答

AI 助手的回答:`

    // 5. 调用 LLM 生成回答
    console.log('\n【AI 回答】')
    console.log('正在调用 LLM...')

    const response = await model.invoke(prompt)
    const answer = response.content || ''

    console.log('\n' + answer)
    console.log('\n')

    return answer
  } catch (error) {
    console.error('回答问题时出错:', error.message)
    return '抱歉，处理您的问题时出现了错误。'
  }
}

async function main() {
  try {
    console.log('连接到 Milvus...')
    await client.connectPromise
    console.log('✓ 已连接\n')

    // 确保集合已加载
    try {
      await client.loadCollection({ collection_name: COLLECTION_NAME })
      console.log('✓ 集合已加载\n')
    } catch (error) {
      // 如果已经加载，会报错，忽略即可
      if (!error.message.includes('already loaded')) {
        throw error
      }
      console.log('✓ 集合已处于加载状态\n')
    }

    // 问一个关于本书的问题
    await answerEbookQuestion(QUESTION, TOP_K)
  } catch (error) {
    console.error('错误:', error.message)
  }
}

main()
