import 'dotenv/config'
import {
  MilvusClient,
  DataType,
  MetricType,
  IndexType,
} from '@zilliz/milvus2-sdk-node'
import { embeddings } from '@/index.mjs'
import { COLLECTION_NAME } from '@/memory/constant.mjs'

// 先动态获取向量维度
let VECTOR_DIM = 1024

const client = new MilvusClient({
  address: 'localhost:19530',
})

/**
 * 获取文本的向量嵌入,带重试机制
 */
async function getEmbedding(text, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await embeddings.embedQuery(text)
      return result
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`  第${i + 1}次尝试失败,等待后重试...`)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

async function main() {
  try {
    console.log('连接到 Milvus...')
    await client.connectPromise
    console.log('✓ 已连接\n')

    // 先测试向量维度
    console.log('测试向量维度...')
    const testEmbedding = await embeddings.embedQuery('test')
    VECTOR_DIM = testEmbedding.length
    console.log(`✓ 向量维度: ${VECTOR_DIM}\n`)

    // 创建集合
    console.log('创建集合...')

    // 检查集合是否存在,存在则不重建(避免清空数据)
    const collections = await client.listCollections()
    const collectionExists =
      collections.data && collections.data.some(c => c.name === COLLECTION_NAME)

    if (collectionExists) {
      console.log(`集合 ${COLLECTION_NAME} 已存在,跳过创建`)
    } else {
      await client.createCollection({
        collection_name: COLLECTION_NAME,
        fields: [
          {
            name: 'id',
            data_type: DataType.VarChar,
            max_length: 50,
            is_primary_key: true,
          },
          { name: 'vector', data_type: DataType.FloatVector, dim: VECTOR_DIM },
          { name: 'content', data_type: DataType.VarChar, max_length: 5000 },
          { name: 'round', data_type: DataType.Int64 },
          { name: 'timestamp', data_type: DataType.VarChar, max_length: 100 },
        ],
      })
      console.log('✓ 集合已创建')

      // 创建索引
      console.log('\n创建索引...')
      await client.createIndex({
        collection_name: COLLECTION_NAME,
        field_name: 'vector',
        index_type: IndexType.IVF_FLAT,
        metric_type: MetricType.COSINE,
        params: { nlist: 1024 },
      })
      console.log('✓ 索引已创建')
    }

    // 加载集合
    console.log('\n加载集合...')
    await client.loadCollection({ collection_name: COLLECTION_NAME })
    console.log('✓ 集合已加载')

    // 插入对话数据
    console.log('\n插入对话数据...')
    const conversations = [
      {
        id: 'conv_001',
        content:
          '用户: 我叫赵六，是一名数据科学家\n助手: 很高兴认识你，赵六！数据科学是一个很有趣的领域。',
        round: 1,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'conv_002',
        content:
          '用户: 我最近在研究机器学习算法\n助手: 机器学习确实很有意思，你在研究哪些算法呢？',
        round: 2,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'conv_003',
        content:
          '用户: 我喜欢打篮球和看电影\n助手: 运动和文化娱乐都是很好的爱好！',
        round: 3,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'conv_004',
        content: '用户: 我周末经常去电影院\n助手: 看电影是很好的放松方式。',
        round: 4,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'conv_005',
        content:
          '用户: 我的职业是软件工程师\n助手: 软件工程师是个很有前景的职业！',
        round: 5,
        timestamp: new Date().toISOString(),
      },
    ]

    console.log('生成向量嵌入...')
    const conversationData = []
    for (const conv of conversations) {
      console.log(`  处理: ${conv.id}`)
      const vector = await getEmbedding(conv.content)
      conversationData.push({ ...conv, vector })
    }

    const insertResult = await client.insert({
      collection_name: COLLECTION_NAME,
      data: conversationData,
    })
    console.log(`✓ 已插入 ${insertResult.insert_cnt} 条记录`)

    // 刷新数据,确保数据持久化
    console.log('刷新数据...')
    await client.flush({ collection_names: [COLLECTION_NAME] })
    console.log('✓ 数据已刷新\n')

    console.log('='.repeat(60))
    console.log('说明：已成功将对话数据插入到 Milvus 向量数据库')
    console.log('这些对话数据将用于后续的 RAG 检索')
    console.log('='.repeat(60) + '\n')
  } catch (error) {
    console.error('错误:', error.message)
    console.error('详细错误:', error)
  }
}

main()
