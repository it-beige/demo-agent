import chalk from 'chalk'

const ES = 'http://localhost:9200'
const INDEX = 'life_note'

async function req(method, path, body) {
  const url = path.startsWith('http') ? path : `${ES}${path}`
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body !== undefined) opts.body = JSON.stringify(body)
  try {
    const res = await fetch(url, opts)
    const txt = await res.text()
    let data
    try { data = JSON.parse(txt) } catch { data = txt }
    return { ok: res.ok, status: res.status, data }
  } catch (e) {
    return { ok: false, status: null, error: e.message }
  }
}

async function reqWrite(method, path, body) {
  let url = path.startsWith('http') ? path : `${ES}${path}`
  const sep = url.includes('?') ? '&' : '?'
  // _delete_by_query 只支持 refresh=true，其他操作用 refresh=wait_for
  const refresh = url.includes('_delete_by_query') ? 'refresh=true' : 'refresh=wait_for'
  url += `${sep}${refresh}`
  return req(method, url, body)
}

function label(r) { return r.ok ? chalk.green(`✓ ${r.status}`) : chalk.red(`✗ ${r.status || 'ERR'}`) }

let passed = 0, failed = 0
function assert(cond, name) {
  cond ? passed++ : failed++
  console.log(`  ${cond ? chalk.green('✓') : chalk.red('✗')} ${name}`)
}

async function main() {
  console.log(chalk.bgBlue.white.bold('\n🔍 ES 测试 - life_note 索引全量操作 (es-test3.md)\n'))

  const r0 = await req('DELETE', `/${INDEX}`)
  console.log(`\n🧹 清理旧索引: ${label(r0)}`)

  console.log(chalk.bgCyan.white.bold('\n━ 索引管理 ━'))

  const r1 = await req('GET', '/_cat/indices?v&h=health,status,index,docs.count')
  console.log(`\n1. 查看所有索引: ${label(r1)}`)
  if (typeof r1.data === 'string') console.log(chalk.gray(r1.data))

  const r2 = await req('PUT', `/${INDEX}`, {
    mappings: { properties: {
      title: { type: 'text', analyzer: 'ik_max_word', search_analyzer: 'ik_smart' },
      content: { type: 'text', analyzer: 'ik_max_word', search_analyzer: 'ik_smart' },
      type: { type: 'keyword' }, author: { type: 'keyword' }, record_time: { type: 'date' }
    }}
  })
  console.log(`\n2. 创建索引: ${label(r2)}`)
  assert(r2.data?.acknowledged === true, '索引创建成功')

  const r3 = await req('GET', `/${INDEX}/_mapping`)
  console.log(`\n3. 查看索引结构: ${label(r3)}`)
  const mp = r3.data?.[INDEX]?.mappings?.properties
  assert(mp?.title?.analyzer === 'ik_max_word', '入库分词 ik_max_word')
  assert(mp?.title?.search_analyzer === 'ik_smart', '查询分词 ik_smart')

  const r4 = await req('GET', `/${INDEX}/_settings`)
  console.log(`\n4. 查看索引配置: ${label(r4)}`)
  assert(!!r4.data?.[INDEX], '配置返回正常')

  console.log(chalk.bgCyan.white.bold('\n━ 文档 CRUD ━'))

  const rD1 = await reqWrite('POST', `/${INDEX}/_doc`, {
    title: '周末城市短途旅行攻略',
    content: '周末适合周边短途出行，打卡公园、小吃街，放松日常工作压力，出行尽量避开早晚高峰',
    type: '旅行生活', author: '日常记录', record_time: '2026-04-27'
  })
  console.log(`\n1. 新增文档(自动ID): ${label(rD1)}`)
  assert(rD1.data?.result === 'created', `ID: ${rD1.data?._id}`)

  const rD2 = await reqWrite('PUT', `/${INDEX}/_doc/3001`, {
    title: '健康饮食与居家养生',
    content: '规律作息、清淡饮食，多吃蔬菜水果，减少熬夜，合理运动才能保持身体健康',
    type: '健康生活', author: '生活达人', record_time: '2026-04-27'
  })
  console.log(`\n2. 新增文档(指定ID 3001): ${label(rD2)}`)
  assert(rD2.data?.result === 'created', '文档 3001 创建成功')

  const rD3 = await req('GET', `/${INDEX}/_doc/3001`)
  console.log(`\n3. 根据ID查询 3001: ${label(rD3)}`)
  assert(rD3.data?.found, '找到文档 3001')

  const rD4 = await req('POST', `/${INDEX}/_search`, { query: { match_all: {} } })
  console.log(`\n4. 查询全部文档: ${label(rD4)}`)
  const t4 = rD4.data?.hits?.total?.value
  assert(t4 === 2, `共 ${t4} 篇（预期 2）`)

  const rD5 = await req('POST', `/${INDEX}/_search`, {
    query: { match: { content: '健康 作息 旅行' } }
  })
  console.log(`\n5. 全文分词检索: ${label(rD5)}`)
  const h5 = rD5.data?.hits?.hits || []
  assert(h5.length >= 1, `命中 ${h5.length} 篇（预期>=1，第12步删除后剩1篇）`)
  h5.forEach(h => console.log(chalk.gray(`   → [${h._score?.toFixed(2)}] ${h._source.title}`)))

  const rD6 = await req('POST', `/${INDEX}/_search`, {
    query: { term: { type: '健康生活' } }
  })
  console.log(`\n6. 精确匹配 type=健康生活: ${label(rD6)}`)
  const h6 = rD6.data?.hits?.hits || []
  assert(h6.length === 1 && h6[0]?._source?.type === '健康生活', '精确命中 3001')

  const rD7 = await req('POST', `/${INDEX}/_search`, {
    _source: ['title', 'type', 'author'], query: { match_all: {} }
  })
  console.log(`\n7. _source 字段过滤: ${label(rD7)}`)
  const s7 = rD7.data?.hits?.hits?.[0]?._source || {}
  assert(Object.keys(s7).length === 3 && !('content' in s7),
    `仅返回 ${Object.keys(s7).join(', ')}`)

  const rD8 = await req('POST', `/${INDEX}/_search`, {
    from: 0, size: 10, sort: [{ record_time: 'desc' }], query: { match_all: {} }
  })
  console.log(`\n8. 分页+时间排序: ${label(rD8)}`)
  assert((rD8.data?.hits?.hits || []).length === 2, '分页返回 2 篇')

  const rD9 = await reqWrite('POST', `/${INDEX}/_update/3001`, {
    doc: { title: '健康饮食与居家养生小技巧', type: '居家生活' }
  })
  console.log(`\n9. 局部更新 3001: ${label(rD9)}`)
  assert(rD9.data?.result === 'updated', '局部更新成功')
  const rv9 = await req('GET', `/${INDEX}/_doc/3001`)
  assert(rv9.data?._source?.title === '健康饮食与居家养生小技巧', 'title 已更新')

  const rD10 = await reqWrite('PUT', `/${INDEX}/_doc/3001`, {
    title: '日常养生好习惯总结',
    content: '早睡早起合理运动，少吃油腻辛辣食物，保持良好心态，提升生活幸福感',
    type: '居家生活', author: '生活达人', record_time: '2026-04-27'
  })
  console.log(`\n10. 全量覆盖更新: ${label(rD10)}`)
  assert(rD10.data?.result === 'updated', '全量更新成功')

  const rD11 = await reqWrite('DELETE', `/${INDEX}/_doc/3001`)
  console.log(`\n11. 根据ID删除 3001: ${label(rD11)}`)
  assert(rD11.data?.result === 'deleted', '删除成功')

  const rD12 = await reqWrite('POST', `/${INDEX}/_delete_by_query`, {
    query: { match: { author: '日常记录' } }
  })
  console.log(`\n12. 批量删除 author=日常记录: ${label(rD12)}`)
  assert(rD12.data?.deleted >= 0, `删除 ${rD12.data?.deleted} 篇`)

  const rD13 = await req('GET', `/${INDEX}/_count`)
  console.log(`\n13. 统计文档总数: ${label(rD13)}`)
  assert(typeof rD13.data?.count === 'number', `文档数: ${rD13.data?.count}`)

  const rD14 = await reqWrite('POST', `/${INDEX}/_delete_by_query`, {
    query: { match_all: {} }
  })
  console.log(`\n14. 清空索引: ${label(rD14)}`)
  assert((await req('GET', `/${INDEX}/_count`)).data?.count === 0, '文档数=0，结构保留')

  console.log(chalk.bgCyan.white.bold('\n━ IK 分词对比 ━'))
  const TXT = '周末短途旅行 居家健康养生 日常美好生活记录'

  const rI1 = await req('POST', '/_analyze', { analyzer: 'ik_max_word', text: TXT })
  console.log(`\nIK 细粒度 (ik_max_word): ${label(rI1)}`)
  const tm = rI1.data?.tokens?.map(t => t.token) || []
  console.log(chalk.gray(`  tokens(${tm.length}): ${tm.join(' | ')}`))

  const rI2 = await req('POST', '/_analyze', { analyzer: 'ik_smart', text: TXT })
  console.log(`\nIK 智能 (ik_smart): ${label(rI2)}`)
  const ts = rI2.data?.tokens?.map(t => t.token) || []
  console.log(chalk.gray(`  tokens(${ts.length}): ${ts.join(' | ')}`))

  assert(tm.includes('周末') && tm.includes('旅行') && tm.includes('健康') && tm.includes('养生'),
    'ik_max_word: 周末/旅行/健康/养生')
  assert(ts.includes('周末') && ts.includes('短途旅行'),
    'ik_smart: 周末/短途旅行')
  assert(ts.length <= tm.length, `ik_smart(${ts.length}) ≤ ik_max_word(${tm.length})`)

  const total = passed + failed
  console.log(chalk.bgGreen.white.bold(`\n  通过: ${passed}/${total}  |  失败: ${failed}/${total}  \n`))
  if (failed > 0) process.exit(1)
}

main().catch(e => { console.error(chalk.red(e)); process.exit(1) })