import 'dotenv/config'
import { MilvusClient } from '@zilliz/milvus2-sdk-node'
import { COLLECTION_NAME } from './constant.mjs'

const client = new MilvusClient({
  address: 'localhost:19530',
})

async function main() {
  try {
    console.log('连接到 Milvus...')
    await client.connectPromise
    console.log('✓ 已连接\n')

    // 重新加载集合确保数据可见
    console.log('重新加载集合...')
    await client.releaseCollection({ collection_name: COLLECTION_NAME })
    await client.loadCollection({ collection_name: COLLECTION_NAME })
    console.log('✓ 集合已重新加载\n')

    // 查询所有数据
    console.log('查询集合中的所有数据...')
    const result = await client.query({
      collection_name: COLLECTION_NAME,
      output_fields: ['id', 'content', 'round', 'timestamp'],
      limit: 100,
    })

    console.log(`\n共找到 ${result.data.length} 条记录:\n`)
    console.log('='.repeat(80))

    result.data.forEach((item, index) => {
      console.log(`\n[记录 ${index + 1}]`)
      console.log(`ID: ${item.id}`)
      console.log(`轮次: ${item.round}`)
      console.log(`时间: ${item.timestamp}`)
      console.log(`内容:\n${item.content}`)
      console.log('-'.repeat(80))
    })

    console.log('\n✓ 查询完成')
  } catch (error) {
    console.error('错误:', error.message)
    console.error('详细错误:', error)
  }
}

main()
