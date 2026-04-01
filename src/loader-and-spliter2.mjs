import 'dotenv/config'
import puppeteer from 'puppeteer'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { Document } from '@langchain/core/documents'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory'

const model = new ChatOpenAI({
  model: process.env.MODEL,
  apiKey: process.env.API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.BASE_URL,
  },
})

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.API_KEY,
  model: process.env.EMBEDDING_MODEL,
  configuration: {
    baseURL: process.env.BASE_URL,
  },
})

async function loadArticle() {
  console.log('启动浏览器...')
  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    console.log('打开页面...')
    const page = await browser.newPage()

    console.log('访问掘金文章...')
    await page.goto('https://juejin.cn/post/7233327509919547452', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    })

    // 等待文章内容加载
    await page
      .waitForSelector('.article-content, .markdown-body', { timeout: 10000 })
      .catch(() => {})

    // 额外等待确保内容完全加载
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 提取内容
    const articleData = await page.evaluate(() => {
      const title = document.querySelector('.article-title')?.innerText || ''
      const author = document.querySelector('.author-name')?.innerText || ''

      // 只抓取 .main-area 下所有 p 标签内容
      const mainArea = document.querySelector('.main-area')
      let content = ''
      if (mainArea) {
        const paragraphs = mainArea.querySelectorAll('p')
        content = Array.from(paragraphs)
          .map(p => p.innerText.trim())
          .filter(text => text.length > 0)
          .join('\n\n')
      }

      return { title, content, author }
    })

    console.log('\n✅ 提取成功!')
    console.log('='.repeat(50))
    console.log('标题:', articleData.title)
    console.log('作者:', articleData.author)
    console.log('='.repeat(50))
    console.log('\n内容预览:')
    console.log(articleData.content)
    console.log('\n完整内容长度:', articleData.content.length, '字符')

    // 创建 Document 对象并进行文本分割
    const doc = new Document({
      pageContent: articleData.content,
      metadata: {
        title: articleData.title,
        author: articleData.author,
        source: 'https://juejin.cn/post/7233327509919547452',
      },
    })

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 50,
      separators: ['。', '!', '？'],
    })
    const chunks = await textSplitter.splitDocuments([doc])

    console.log('\n📦 分割完成，共生成', chunks.length, '个片段:')
    console.log('='.repeat(50))
    chunks.forEach((chunk, index) => {
      console.log(`\n[片段 ${index + 1}/${chunks.length}]`)
      console.log(chunk.pageContent)
      console.log('---')
    })
    return chunks
  } catch (error) {
    console.error('❌ 提取失败:', error.message)
    throw error
  } finally {
    await browser.close()
  }
}

const chunks = await loadArticle()
console.log('向量存储中...')
const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings)
console.log('向量存储完成')
const retriever = vectorStore.asRetriever({ k: 2 })
const questions = ['作者人生态度的转变从何而来？']

for (const question of questions) {
  console.log('问题:', question)
  console.log('='.repeat(80))

  const retrieverResults = await retriever.invoke(question)
  console.log('[检索到的文档相似度评分]')
  retrieverResults.forEach((result, index) => {
    const [, scored] = retrieverResults.find(
      ([scored]) => scored.pageContent === result.content,
    )
  })
}
