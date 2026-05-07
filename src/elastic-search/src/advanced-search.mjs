import { Client } from '@elastic/elasticsearch'

const client = new Client({
  node: 'http://localhost:9200',
})

const INDEX_NAME = 'travel_journal'

/**
 * 演示高亮显示、分页查询、排序的完整搜索实现
 */

// 1. 完整搜索功能（高亮 + 分页 + 排序）
async function completeSearchDemo() {
  console.log('\n========== 3.1 完整搜索功能演示 ==========')

  const searchQuery = '运动'
  const page = 1
  const pageSize = 5

  const res = await client.search({
    index: INDEX_NAME,
    query: {
      multi_match: {
        query: searchQuery,
        fields: ['note_title^2', 'note_body'],
        analyzer: 'ik_smart',
      },
    },
    highlight: {
      fields: {
        note_title: {
          pre_tags: '<mark>',
          post_tags: '</mark>',
        },
        note_body: {
          pre_tags: '<mark>',
          post_tags: '</mark>',
          fragment_size: 100,
          number_of_fragments: 2,
        },
      },
    },
    sort: [{ _score: 'desc' }, { priority: 'desc' }, { created_at: 'desc' }],
    from: (page - 1) * pageSize,
    size: pageSize,
  })

  console.log(`🔍 搜索关键词: "${searchQuery}"`)
  console.log(`📊 总命中: ${res.hits.total.value} 条`)
  console.log(`📄 当前页: ${page}, 每页: ${pageSize} 条\n`)

  res.hits.hits.forEach((hit, idx) => {
    console.log(`结果 ${idx + 1} (评分: ${hit._score.toFixed(4)}):`)
    console.log(`  ID: ${hit._id}`)
    console.log(`  标题: ${hit._source.note_title}`)

    if (hit.highlight?.note_title) {
      console.log(`  高亮标题: ${hit.highlight.note_title[0]}`)
    }

    if (hit.highlight?.note_body) {
      console.log(`  高亮摘要: ${hit.highlight.note_body[0]}`)
    }

    console.log(`  优先级: ${hit._source.priority}`)
    console.log(`  心情: ${hit._source.mood}`)
    console.log('')
  })
}

// 2. 高级搜索选项演示
async function advancedSearchOptions() {
  console.log('\n========== 3.2 高级搜索选项 ==========')

  // 2.1 布尔查询：must + should + must_not
  console.log('\n--- 2.1 布尔查询组合 ---')
  const boolRes = await client.search({
    index: INDEX_NAME,
    query: {
      bool: {
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
        should: [
          {
            term: {
              mood: 'energetic',
            },
          },
        ],
        must_not: [
          {
            range: {
              priority: {
                lt: 2,
              },
            },
          },
        ],
      },
    },
  })

  console.log(`找到 ${boolRes.hits.hits.length} 条结果`)
  boolRes.hits.hits.forEach((hit, idx) => {
    console.log(
      `  ${idx + 1}. ${hit._source.note_title} (评分: ${hit._score.toFixed(2)})`,
    )
  })

  // 2.2 过滤查询（不影响评分）
  console.log('\n--- 2.2 过滤查询 ---')
  const filterRes = await client.search({
    index: INDEX_NAME,
    query: {
      bool: {
        must: {
          match_all: {},
        },
        filter: [
          {
            term: {
              tags: '运动',
            },
          },
          {
            range: {
              priority: {
                gte: 2,
              },
            },
          },
        ],
      },
    },
  })

  console.log(`过滤结果: ${filterRes.hits.hits.length} 条`)
  filterRes.hits.hits.forEach((hit, idx) => {
    console.log(
      `  ${idx + 1}. ${hit._source.note_title} [优先级: ${hit._source.priority}]`,
    )
  })

  // 2.3 聚合查询
  console.log('\n--- 2.3 聚合查询 ---')
  const aggRes = await client.search({
    index: INDEX_NAME,
    size: 0, // 不返回文档，只返回聚合结果
    aggs: {
      mood_distribution: {
        terms: {
          field: 'mood',
        },
      },
      priority_stats: {
        stats: {
          field: 'priority',
        },
      },
      tags_distribution: {
        terms: {
          field: 'tags',
        },
      },
    },
  })

  console.log('心情分布:')
  aggRes.aggregations.mood_distribution.buckets.forEach(bucket => {
    console.log(`  ${bucket.key}: ${bucket.doc_count} 条`)
  })

  console.log('\n优先级统计:')
  console.log(`  最小值: ${aggRes.aggregations.priority_stats.min}`)
  console.log(`  最大值: ${aggRes.aggregations.priority_stats.max}`)
  console.log(`  平均值: ${aggRes.aggregations.priority_stats.avg.toFixed(2)}`)

  console.log('\n标签分布:')
  aggRes.aggregations.tags_distribution.buckets.slice(0, 5).forEach(bucket => {
    console.log(`  ${bucket.key}: ${bucket.doc_count} 条`)
  })
}

// 3. 分页和排序深入演示
async function paginationAndSortingDeepDive() {
  console.log('\n========== 3.3 分页和排序深入演示 ==========')

  // 3.1 普通分页（from + size）
  console.log('\n--- 3.1 普通分页查询 ---')
  const pageSize = 3
  const totalPages = 3

  for (let page = 1; page <= totalPages; page++) {
    const res = await client.search({
      index: INDEX_NAME,
      query: {
        match_all: {},
      },
      from: (page - 1) * pageSize,
      size: pageSize,
      sort: [{ priority: 'desc' }, { created_at: 'desc' }],
    })

    console.log(`\n第 ${page} 页:`)
    console.log(`  总数: ${res.hits.total.value} 条`)
    console.log(
      `  当前页: ${page}/${Math.ceil(res.hits.total.value / pageSize)}`,
    )

    res.hits.hits.forEach((hit, idx) => {
      console.log(
        `  ${idx + 1}. ${hit._source.note_title} [优先级: ${hit._source.priority}]`,
      )
    })
  }

  // 3.2 多字段排序
  console.log('\n--- 3.2 多字段排序 ---')
  const multiSortRes = await client.search({
    index: INDEX_NAME,
    query: {
      match_all: {},
    },
    sort: [{ priority: 'desc' }, { mood: 'asc' }, { created_at: 'desc' }],
    size: 5,
  })

  console.log('排序结果（优先级↓ 心情↑ 时间↓）:')
  multiSortRes.hits.hits.forEach((hit, idx) => {
    console.log(
      `  ${idx + 1}. ${hit._source.note_title} [优先级: ${hit._source.priority}, 心情: ${hit._source.mood}]`,
    )
  })

  // 3.3 相关性评分排序（默认）
  console.log('\n--- 3.3 相关性评分排序 ---')
  const scoreRes = await client.search({
    index: INDEX_NAME,
    query: {
      multi_match: {
        query: '旅行 运动',
        fields: ['note_title^3', 'note_body', 'tags^2'],
        analyzer: 'ik_smart',
      },
    },
    size: 5,
  })

  console.log('搜索结果（按相关性评分）:')
  scoreRes.hits.hits.forEach((hit, idx) => {
    console.log(
      `  ${idx + 1}. ${hit._source.note_title} (评分: ${hit._score.toFixed(4)})`,
    )
  })
}

// 4. 实战：构建完整的搜索 API
async function completeSearchAPI() {
  console.log('\n========== 3.4 实战：完整搜索 API ==========')

  // 模拟一个完整的搜索 API 实现
  async function searchAPI(params) {
    const {
      query = '',
      page = 1,
      pageSize = 10,
      sortBy = '_score',
      sortOrder = 'desc',
      filters = {},
      highlight = true,
    } = params

    // 构建查询
    const searchParams = {
      index: INDEX_NAME,
      query: {
        bool: {
          must: [],
          filter: [],
        },
      },
      from: (page - 1) * pageSize,
      size: pageSize,
      sort: [],
    }

    // 添加关键词搜索
    if (query) {
      searchParams.query.bool.must.push({
        multi_match: {
          query: query,
          fields: ['note_title^3', 'note_body', 'tags^2'],
          analyzer: 'ik_smart',
        },
      })
    } else {
      searchParams.query.bool.must.push({
        match_all: {},
      })
    }

    // 添加过滤器
    if (filters.mood) {
      searchParams.query.bool.filter.push({
        term: { mood: filters.mood },
      })
    }

    if (filters.priority) {
      searchParams.query.bool.filter.push({
        range: { priority: filters.priority },
      })
    }

    if (filters.tags) {
      searchParams.query.bool.filter.push({
        term: { tags: filters.tags },
      })
    }

    // 添加排序
    if (sortBy === '_score') {
      searchParams.sort.push({ _score: sortOrder })
    } else {
      searchParams.sort.push({ [sortBy]: sortOrder })
    }
    searchParams.sort.push({ created_at: 'desc' })

    // 添加高亮
    if (highlight && query) {
      searchParams.highlight = {
        fields: {
          note_title: {
            pre_tags: '<mark>',
            post_tags: '</mark>',
          },
          note_body: {
            pre_tags: '<mark>',
            post_tags: '</mark>',
            fragment_size: 150,
            number_of_fragments: 2,
          },
        },
      }
    }

    // 执行搜索
    const res = await client.search(searchParams)

    // 格式化结果
    return {
      total: res.hits.total.value,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(res.hits.total.value / pageSize),
      results: res.hits.hits.map(hit => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
        highlight: hit.highlight || null,
      })),
    }
  }

  // 测试 1: 关键词搜索
  console.log('\n--- 测试 1: 搜索 "运动" ---')
  const result1 = await searchAPI({
    query: '运动',
    page: 1,
    pageSize: 3,
  })
  console.log(
    `结果: 共 ${result1.total} 条，第 ${result1.page}/${result1.totalPages} 页`,
  )
  result1.results.forEach((item, idx) => {
    console.log(
      `  ${idx + 1}. ${item.note_title} (评分: ${item.score?.toFixed(2)})`,
    )
    if (item.highlight?.note_title) {
      console.log(`     高亮: ${item.highlight.note_title[0]}`)
    }
  })

  // 测试 2: 带过滤的搜索
  console.log('\n--- 测试 2: 搜索所有，过滤心情为 "energetic" ---')
  const result2 = await searchAPI({
    query: '',
    page: 1,
    pageSize: 5,
    filters: {
      mood: 'energetic',
    },
    sortBy: 'priority',
    sortOrder: 'desc',
  })
  console.log(`结果: 共 ${result2.total} 条`)
  result2.results.forEach((item, idx) => {
    console.log(
      `  ${idx + 1}. ${item.note_title} [心情: ${item.mood}, 优先级: ${item.priority}]`,
    )
  })

  // 测试 3: 组合搜索
  console.log('\n--- 测试 3: 搜索 "骑行" + 优先级 >= 3 ---')
  const result3 = await searchAPI({
    query: '骑行',
    page: 1,
    pageSize: 5,
    filters: {
      priority: { gte: 3 },
    },
    sortBy: '_score',
    sortOrder: 'desc',
  })
  console.log(`结果: 共 ${result3.total} 条`)
  result3.results.forEach((item, idx) => {
    console.log(
      `  ${idx + 1}. ${item.note_title} (评分: ${item.score?.toFixed(2)}, 优先级: ${item.priority})`,
    )
  })
}

async function run() {
  try {
    await completeSearchDemo()
    await advancedSearchOptions()
    await paginationAndSortingDeepDive()
    await completeSearchAPI()

    console.log('\n✅ 高级搜索功能演示完成！')
    console.log('\n💡 学习要点：')
    console.log('1. highlight 可以让用户看到匹配关键词的位置')
    console.log('2. from + size 实现分页，注意深度分页性能问题')
    console.log('3. sort 支持多字段排序和自定义排序规则')
    console.log('4. bool 查询可以组合 must/should/must_not/filter')
    console.log('5. 聚合查询可以做统计分析')
    console.log('6. 可以组合使用高亮、分页、排序构建完整搜索功能')
    console.log('7. fragment_size 控制高亮片段长度，适合做摘要')
  } catch (err) {
    console.error('❌ 演示失败:', err.message)
  }
}

run().catch(err => {
  console.error('❌ 脚本执行失败:', err)
  process.exit(1)
})
