import 'dotenv/config'
import { MilvusClient } from '@zilliz/milvus2-sdk-node'

const COLLECTION_NAME = 'ai_diary'
const MILVUS_ADDRESS = process.env.MILVUS_ADDRESS ?? 'localhost:19530'

const client = new MilvusClient({
  address: MILVUS_ADDRESS,
})

function printEntries(entries) {
  entries.forEach((entry, index) => {
    console.log(`${index + 1}. [${entry.id}] ${entry.date} / ${entry.mood}`)
    console.log(`   Tags: ${entry.tags?.join(', ')}`)
    console.log(`   Content: ${entry.content}\n`)
  })
}

async function main() {
  try {
    console.log('Connecting to Milvus...')
    await client.connectPromise
    console.log('✓ Connected\n')

    // 刷盘后统计行数，row_count 只统计已落盘的 segment
    console.log('Flushing collection...')
    await client.flush({ collection_names: [COLLECTION_NAME] })

    const stats = await client.getCollectionStatistics({
      collection_name: COLLECTION_NAME,
    })
    console.log(`✓ Row count: ${stats.data.row_count}\n`)

    // 列出全部数据，Strong 一致性保证能读到刚写入的数据
    console.log('Listing all diary entries...')
    const allResult = await client.query({
      collection_name: COLLECTION_NAME,
      filter: 'id != ""',
      output_fields: ['id', 'content', 'date', 'mood', 'tags'],
      limit: 100,
      consistency_level: 'Strong',
    })

    console.log(`Found ${allResult.data.length} entries:\n`)
    printEntries(allResult.data)

    // 按条件过滤
    console.log('Filtering by mood...')
    const moodResult = await client.query({
      collection_name: COLLECTION_NAME,
      filter: 'mood == "happy"',
      output_fields: ['id', 'content', 'date', 'mood', 'tags'],
      limit: 100,
      consistency_level: 'Strong',
    })

    console.log(`Found ${moodResult.data.length} entries with mood="happy":\n`)
    printEntries(moodResult.data)

    // 按主键批量取数据
    console.log('Fetching by ids...')
    const ids = ['diary_001', 'diary_004']
    const idsStr = ids.map(id => `"${id}"`).join(', ')

    const idsResult = await client.query({
      collection_name: COLLECTION_NAME,
      filter: `id in [${idsStr}]`,
      output_fields: ['id', 'content', 'date', 'mood', 'tags'],
      consistency_level: 'Strong',
    })

    console.log(`Found ${idsResult.data.length} entries by ids:\n`)
    printEntries(idsResult.data)
  } catch (error) {
    console.error('Error:', error.message)
  }
}

main()
