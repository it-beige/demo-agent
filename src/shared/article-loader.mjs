import puppeteer from 'puppeteer'
import { Document } from '@langchain/core/documents'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

const DEFAULT_CHROME_PATH =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * @typedef {object} ArticleLoadOptions
 * @property {string} [selector] Cheerio 提取用的选择器
 * @property {string} [containerSelector] Puppeteer 正文容器选择器
 * @property {string} [titleSelector] Puppeteer 标题选择器
 * @property {string} [authorSelector] Puppeteer 作者选择器
 * @property {number} [settleMs] 首屏加载后额外等待时间（毫秒）
 * @property {number} [timeout] 页面导航超时（毫秒）
 */

/**
 * 用 Cheerio 抓取静态 HTML 内容（快，但拿不到 JS 渲染的内容）
 * @param {string} url 文章地址
 * @param {ArticleLoadOptions} [options]
 * @returns {Promise<Document[]>}
 */
export async function loadArticleByCheerio(url, options = {}) {
  const { selector = '.main-area p' } = options

  const loader = new CheerioWebBaseLoader(url, { selector })
  const documents = await loader.load()

  if (!documents.length || !documents[0].pageContent?.trim()) {
    throw new Error('Cheerio 提取到的内容为空')
  }

  return documents
}

/**
 * 用 Puppeteer 抓取内容，适用于 juejin 这类需要 JS 渲染的页面
 * @param {string} url 文章地址
 * @param {ArticleLoadOptions} [options]
 * @returns {Promise<Document[]>}
 */
export async function loadArticleByPuppeteer(url, options = {}) {
  const {
    containerSelector = '.main-area',
    titleSelector = '.article-title',
    authorSelector = '.author-name',
    settleMs = 3000,
    timeout = 60000,
  } = options

  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH || DEFAULT_CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent(DEFAULT_USER_AGENT)

    await page.goto(url, { waitUntil: 'networkidle2', timeout })

    // 正文容器出现即可继续；等不到也不算失败，后面还有兜底等待
    await page
      .waitForSelector(containerSelector, { timeout: 10000 })
      .catch(() => {})

    // networkidle2 之后仍有异步渲染，额外等一小段时间
    await new Promise(resolve => setTimeout(resolve, settleMs))

    const article = await page.evaluate(
      selectors => {
        const title =
          document.querySelector(selectors.titleSelector)?.innerText?.trim() ||
          ''
        const author =
          document.querySelector(selectors.authorSelector)?.innerText?.trim() ||
          ''

        const container = document.querySelector(selectors.containerSelector)
        if (!container) return { title, author, content: '' }

        const content = Array.from(container.querySelectorAll('p'))
          .map(p => p.innerText.trim())
          .filter(text => text.length > 0)
          .join('\n\n')

        return { title, author, content }
      },
      { containerSelector, titleSelector, authorSelector },
    )

    if (!article.content) {
      throw new Error('Puppeteer 未能提取到内容')
    }

    return [
      new Document({
        pageContent: article.content,
        metadata: {
          source: url,
          loader: 'puppeteer',
          title: article.title,
          author: article.author,
        },
      }),
    ]
  } finally {
    await browser.close()
  }
}

/**
 * 加载文章内容：优先 Cheerio，拿不到内容时降级 Puppeteer
 * @param {string} url 文章地址
 * @param {ArticleLoadOptions} [options]
 * @returns {Promise<Document[]>}
 */
export async function loadArticleDocuments(url, options = {}) {
  try {
    console.log('尝试使用 Cheerio 加载网页内容...')
    const documents = await loadArticleByCheerio(url, options)
    console.log(
      `✅ Cheerio 加载成功，共 ${documents.length} 个文档，${documents[0].pageContent.length} 字符`,
    )
    return documents
  } catch (cheerioError) {
    console.warn(
      '⚠️  Cheerio 加载失败，降级使用 Puppeteer:',
      cheerioError.message,
    )
  }

  const documents = await loadArticleByPuppeteer(url, options)
  console.log(
    `✅ Puppeteer 加载成功，提取到 ${documents[0].pageContent.length} 字符`,
  )
  return documents
}

/**
 * 按中文句读切分文档
 * @param {Document[]} documents 待切分文档
 * @param {object} [options]
 * @param {number} [options.chunkSize] 每个分块的字符数
 * @param {number} [options.chunkOverlap] 分块之间的重叠字符数
 * @param {string[]} [options.separators] 分割符，优先级从高到低
 * @returns {Promise<Document[]>}
 */
export async function splitArticleDocuments(documents, options = {}) {
  const {
    chunkSize = 500,
    chunkOverlap = 50,
    separators = ['。', '！', '？'],
  } = options

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators,
  })

  return textSplitter.splitDocuments(documents)
}
