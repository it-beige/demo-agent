import { loadEnvFromNearest } from '../../shared/config.util.mjs'
import { MemoryClient } from 'mem0ai'

loadEnvFromNearest(import.meta.url)

const USER_ID = process.env.MEM0_TEST_USER_ID

function log(title, data) {
  console.log(`\n=== ${title} ===`)
  console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2))
}

async function addMemories(client) {
  const conversation = [
    { role: 'user', content: '我是素食主义者，而且对坚果过敏。' },
    { role: 'assistant', content: '好的，我会记住你的饮食偏好。' },
    { role: 'user', content: '我住在北京，平时喜欢跑步。' },
    { role: 'assistant', content: '已记录：北京、爱好跑步。' },
  ]
  const added = await client.add(conversation, { userId: USER_ID })
  log('添加记忆', added)
}

async function searchMemories(client) {
  const searchResult = await client.search('用户的饮食限制是什么？中文回答', {
    filters: { user_id: USER_ID },
    topK: 5,
  })
  log('搜索记忆', searchResult.results?.map(m => m.memory) ?? [])
}

async function listMemories(client) {
  const allMemories = await client.getAll({
    filters: { user_id: USER_ID },
    pageSize: 10,
  })
  log('列出全部记忆', allMemories.results?.map(m => m.memory) ?? [])
}

async function getAndUpdateMemory(client) {
  const allMemories = await client.getAll({
    filters: { user_id: USER_ID },
    pageSize: 10,
  })
  const firstMemory = allMemories.results?.[0]
  if (!firstMemory?.id) {
    console.log('没有可操作的记忆，请先运行: pnpm start add')
    return
  }

  const memory = await client.get(firstMemory.id)
  log('获取单条记忆', memory)

  const updated = await client.update(firstMemory.id, {
    text: `${memory.memory ?? firstMemory.memory}（已通过示例脚本更新）`,
  })
  log('更新记忆', updated)

  const history = await client.history(firstMemory.id)
  log('记忆变更历史', history)
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
    console.log('\nadd 已提交（异步处理），稍后再运行: pnpm start search')
    return
  }

  if (action === 'search') {
    await searchMemories(client)
    return
  }

  if (action === 'list') {
    await listMemories(client)
    return
  }

  if (action === 'update') {
    await getAndUpdateMemory(client)
    return
  }

  console.error(
    `未知命令: ${action}，可用: add | search | list | update | --cleanup`,
  )
  process.exit(1)
}

main().catch(error => {
  console.error('\n执行失败:', error.message ?? error)
  if (error.suggestion) {
    console.error('建议:', error.suggestion)
  }
  process.exit(1)
})
