import { Client } from '@elastic/elasticsearch'

const client = new Client({
  node: 'http://localhost:9200',
})

const INDEX_NAME = 'travel_journal'

/**
 * 演示 bool 查询、范围查询、多字段搜索
 */

// 1. bool 查询：多条件组合（must + filter + should）
async function boolQueryDemo() {
  console.log('\n========== 1.1 Bool 查询演示 ==========')

  const res = await client.search({
    index: INDEX_NAME,
    query: {
      bool: {
        // must: 必须满足，影响相关性评分
        must: [
          {
            match: {
              note_body: {
                query: '运动',
                analyzer: 'ik_smart',
              },
            },
          },
        ],
        // filter: 必须满足，不影响评分（性能更好）
        filter: [
          {
            term: {
              mood: 'energetic',
            },
          },
          {
            range: {
              priority: {
                gte: 2,
                lte: 3,
              },
            },
          },
        ],
        // should: 满足更好，但不是必须（提升评分）
        should: [
          {
            match: {
              tags: '骑行',
            },
          },
        ],
        // minimum_should_match: should 至少满足几个
        minimum_should_match: 0,
      },
    },
  })

  console.log(`📊 找到 ${res.hits.hits.length} 条结果:`)
  res.hits.hits.forEach((hit, idx) => {
    console.log(`\n结果 ${idx + 1} (评分: ${hit._score}):`)
    console.log(`  ID: ${hit._id}`)
    console.log(`  标题: ${hit._source.note_title}`)
    console.log(`  正文: ${hit._source.note_body}`)
    console.log(`  心情: ${hit._source.mood}`)
    console.log(`  优先级: ${hit._source.priority}`)
    console.log(`  标签: ${hit._source.tags.join(', ')}`)
  })
}

// 2. 范围查询：日期和数字范围
async function rangeQueryDemo() {
  console.log('\n========== 1.2 范围查询演示 ==========')

  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const res = await client.search({
    index: INDEX_NAME,
    query: {
      bool: {
        filter: [
          {
            range: {
              created_at: {
                gte: oneDayAgo.toISOString(),
                lte: now.toISOString(),
              },
            },
          },
          {
            range: {
              priority: {
                gte: 1,
                lt: 3,
              },
            },
          },
        ],
      },
    },
    sort: [{ priority: 'desc' }, { created_at: 'desc' }],
  })

  console.log(`📊 找到 ${res.hits.hits.length} 条结果（按优先级和时间排序）:`)
  res.hits.hits.forEach((hit, idx) => {
    console.log(`\n结果 ${idx + 1}:`)
    console.log(`  标题: ${hit._source.note_title}`)
    console.log(`  优先级: ${hit._source.priority}`)
    console.log(`  创建时间: ${hit._source.created_at}`)
  })
}

// 3. multi_match 查询：多字段搜索
async function multiMatchQueryDemo() {
  console.log('\n========== 1.3 多字段搜索演示 ==========')

  const res = await client.search({
    index: INDEX_NAME,
    query: {
      multi_match: {
        query: '杭州骑行',
        fields: ['note_title^2', 'note_body', 'tags'], // ^2 表示权重加倍
        type: 'best_fields',
        analyzer: 'ik_smart',
      },
    },
  })

  console.log(`📊 找到 ${res.hits.hits.length} 条结果:`)
  res.hits.hits.forEach((hit, idx) => {
    console.log(`\n结果 ${idx + 1} (评分: ${hit._score}):`)
    console.log(`  ID: ${hit._id}`)
    console.log(`  标题: ${hit._source.note_title}`)
    console.log(`  正文: ${hit._source.note_body}`)
    console.log(`  标签: ${hit._source.tags.join(', ')}`)
  })
}

// 4. 组合查询实战：复杂的业务场景
async function complexQueryDemo() {
  console.log('\n========== 1.4 复杂查询实战 ==========')

  const res = await client.search({
    index: INDEX_NAME,
    query: {
      bool: {
        // 必须包含运动相关关键词
        must: [
          {
            multi_match: {
              query: '跑步 骑行 运动',
              fields: ['note_title', 'note_body'],
              analyzer: 'ik_smart',
            },
          },
        ],
        // 过滤：高优先级且最近创建的
        filter: [
          {
            range: {
              priority: {
                gte: 2,
              },
            },
          },
        ],
        // 不应该包含的内容
        must_not: [
          {
            term: {
              mood: 'calm',
            },
          },
        ],
      },
    },
    sort: [{ priority: 'desc' }, { _score: 'desc' }],
    size: 10,
  })

  console.log(`📊 找到 ${res.hits.hits.length} 条高优先级运动相关记录:`)
  res.hits.hits.forEach((hit, idx) => {
    console.log(`\n结果 ${idx + 1}:`)
    console.log(`  标题: ${hit._source.note_title}`)
    console.log(`  正文: ${hit._source.note_body}`)
    console.log(`  优先级: ${hit._source.priority}`)
    console.log(`  心情: ${hit._source.mood}`)
  })
}

async function run() {
  try {
    await boolQueryDemo()
    await rangeQueryDemo()
    await multiMatchQueryDemo()
    await complexQueryDemo()

    console.log('\n✅ 复杂查询演示完成！')
    console.log('\n💡 学习要点：')
    console.log('1. bool 查询可以组合 must/filter/should/must_not')
    console.log('2. filter 不影响评分，性能更好，适合精确过滤')
    console.log('3. range 查询支持数字和日期范围')
    console.log('4. multi_match 可以同时搜索多个字段')
    console.log('5. 使用 ^ 符号可以调整字段权重')
  } catch (err) {
    console.error('❌ 查询失败:', err.message)
  }
}

run().catch(err => {
  console.error('❌ 脚本执行失败:', err)
  process.exit(1)
})
