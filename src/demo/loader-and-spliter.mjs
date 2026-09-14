import 'dotenv/config'
import {
  loadArticleDocuments,
  splitArticleDocuments,
} from '../shared/article-loader.mjs'

const ARTICLE_URL = 'https://juejin.cn/post/7233327509919547452'

async function main() {
  const documents = await loadArticleDocuments(ARTICLE_URL)
  const [article] = documents

  console.log('\n✅ 提取成功!')
  console.log('='.repeat(50))
  console.log('标题:', article.metadata.title || '(未获取)')
  console.log('作者:', article.metadata.author || '(未获取)')
  console.log('='.repeat(50))
  console.log('\n内容预览:')
  console.log(article.pageContent)
  console.log('\n完整内容长度:', article.pageContent.length, '字符')

  const chunks = await splitArticleDocuments(documents, { chunkSize: 400 })

  console.log('\n📦 分割完成，共生成', chunks.length, '个片段:')
  console.log('='.repeat(50))
  chunks.forEach((chunk, index) => {
    console.log(`\n[片段 ${index + 1}/${chunks.length}]`)
    console.log(chunk.pageContent)
    console.log('---')
  })
}

main().catch(error => {
  console.error('❌ 提取失败:', error.message)
  process.exitCode = 1
})
