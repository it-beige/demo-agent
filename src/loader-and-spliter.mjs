import 'dotenv/config'
import puppeteer from 'puppeteer'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { Document } from '@langchain/core/documents'

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
  } catch (error) {
    console.error('❌ 提取失败:', error.message)
    throw error
  } finally {
    await browser.close()
  }
}

loadArticle()
