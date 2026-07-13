/**
 * Mem0 混合搜索（Hybrid Search）测试
 *
 * 演示 rerank、threshold、topK 参数对搜索结果质量的影响：
 * - 基础向量搜索 vs rerank 增强搜索
 * - 不同 threshold 过滤低相关结果
 * - 对比 keyword 命中与语义匹配的差异
 *
 * 用法：
 *   pnpm hybrid-search          # 添加测试数据
 *   pnpm hybrid-search:run      # 运行混合搜索对比
 *   pnpm hybrid-search:cleanup  # 清理测试数据
 */
import { loadEnvFromNearest } from '../../shared/config.util.mjs'
import { MemoryClient } from 'mem0ai'

loadEnvFromNearest(import.meta.url)

const USER_ID = process.env.MEM0_HYBRID_USER_ID

function log(title, data) {
  console.log(`\n=== ${title} ===`)
  console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2))
}

async function addMemories(client) {
  const conversations = [
    [
      {
        role: 'user',
        content: '我最近在学 Rust，想用它重写一个高性能的日志收集器。',
      },
      {
        role: 'assistant',
        content: '好的，Rust 适合高性能场景，日志收集器可以用 tokio 做异步。',
      },
    ],
    [
      {
        role: 'user',
        content: '我对花生严重过敏，吃完会休克，出门吃饭必带肾上腺素笔。',
      },
      {
        role: 'assistant',
        content: '已记录花生严重过敏，随身携带肾上腺素笔。',
      },
    ],
    [
      {
        role: 'user',
        content: '我的猫叫橘子，三岁，是一只橘猫，最爱吃冻干鸡肉。',
      },
      {
        role: 'assistant',
        content: '记住了，橘子是一只三岁橘猫，喜欢吃冻干鸡肉。',
      },
    ],
    [
      {
        role: 'user',
        content: '上周去了九寨沟，水特别蓝，推荐秋天去，人少景美。',
      },
      { role: 'assistant', content: '已记录九寨沟旅行经历，推荐秋季前往。' },
    ],
    [
      {
        role: 'user',
        content: '我的 GitHub 用户名是 beige-bits，博客地址是 beige.dev。',
      },
      {
        role: 'assistant',
        content: '已记录 GitHub 用户名 beige-bits 和博客地址 beige.dev。',
      },
    ],
  ]

  for (const conv of conversations) {
    const added = await client.add(conv, { userId: USER_ID })
    log('add', added)
  }

  console.log('\nadd 已提交（异步处理），稍后再运行: pnpm hybrid-search:run')
}

async function searchAndCompare(client) {
  const queries = [
    {
      label: '语义匹配 — 编程语言相关',
      query: '用什么语言做高性能开发',
    },
    {
      label: '关键词 + 语义混合 — 过敏相关',
      query: '花生过敏 休克',
    },
    {
      label: '宽泛语义 — 宠物',
      query: '家里养了什么动物',
    },
  ]

  for (const { label, query } of queries) {
    log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, label)
    log('查询', query)

    // 1. 基础向量搜索
    const basic = await client.search(query, {
      filters: { user_id: USER_ID },
      topK: 5,
    })
    log(
      '基础搜索 (vector only)',
      basic.results?.map(m => ({
        memory: m.memory,
        score: m.score,
      })),
    )

    // 2. rerank 增强搜索
    const reranked = await client.search(query, {
      filters: { user_id: USER_ID },
      topK: 5,
      rerank: true,
    })
    log(
      'Rerank 搜索 (vector + rerank)',
      reranked.results?.map(m => ({
        memory: m.memory,
        score: m.score,
      })),
    )

    // 3. 高 threshold 严格过滤
    const strict = await client.search(query, {
      filters: { user_id: USER_ID },
      topK: 5,
      threshold: 0.5,
    })
    log(
      '严格 threshold=0.5',
      strict.results?.map(m => ({
        memory: m.memory,
        score: m.score,
      })),
    )
  }

  // 列出全部记忆
  const all = await client.getAll({
    filters: { user_id: USER_ID },
    pageSize: 20,
  })
  log(
    '\n全部记忆',
    all.results?.map(m => m.memory),
  )
}

async function main() {
  if (!process.env.MEM0_API_KEY) {
    console.error('缺少 MEM0_API_KEY')
    process.exit(1)
  }

  const client = new MemoryClient({
    apiKey: process.env.MEM0_API_KEY,
  })

  const action = process.argv[2] ?? 'add'

  if (process.argv.includes('--cleanup')) {
    const deleted = await client.deleteAll({ userId: USER_ID })
    log('清理测试数据', deleted)
    return
  }

  if (action === 'add') {
    await addMemories(client)
    return
  }

  if (action === 'search') {
    await searchAndCompare(client)
    return
  }

  console.error(`未知命令: ${action}，可用: add | search | --cleanup`)
  process.exit(1)
}

main().catch(error => {
  console.error('\n执行失败:', error.message ?? error)
  if (error.suggestion) console.error('建议:', error.suggestion)
  process.exit(1)
})
