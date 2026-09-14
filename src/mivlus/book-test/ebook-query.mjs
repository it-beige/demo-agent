import { MilvusClient, MetricType } from '@zilliz/milvus2-sdk-node'
import { embeddings } from '../../shared/model.mjs'

const COLLECTION_NAME = process.env.EBOOK_COLLECTION_NAME
const MILVUS_ADDRESS = process.env.MILVUS_ADDRESS ?? 'localhost:19530'
const TOP_K = parseInt(process.env.EBOOK_TOP_K) || 5
const QUESTION ='鸠摩智会什么武功？';

const client = new MilvusClient({
  address: MILVUS_ADDRESS,
})

async function getEmbedding(text) {
  const result = await embeddings.embedQuery(text)
  return result
}

async function main() {
  try {
    console.log('Connecting to Milvus...')
    await client.connectPromise
    console.log('✓ Connected\n')

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

    // 向量搜索
    console.log('Searching for similar ebook content...')
    const query = QUESTION
    console.log(`Query: "${query}"\n`)

    const queryVector = await getEmbedding(query)
    const searchResult = await client.search({
      collection_name: COLLECTION_NAME,
      vector: queryVector,
      limit: TOP_K,
      metric_type: MetricType.COSINE,
      output_fields: ['id', 'book_id', 'chapter_num', 'index', 'content'],
    })

    console.log(`Found ${searchResult.results.length} results:\n`)
    searchResult.results.forEach((item, index) => {
      console.log(`${index + 1}. [Score: ${item.score.toFixed(4)}]`)
      console.log(`   ID: ${item.id}`)
      console.log(`   Book ID: ${item.book_id}`)
      console.log(`   Chapter: 第 ${item.chapter_num} 章`)
      console.log(`   Index: ${item.index}`)
      console.log(`   Content: ${item.content}\n`)
    })
  } catch (error) {
    console.error('Error:', error.message)
  }
}

main()
