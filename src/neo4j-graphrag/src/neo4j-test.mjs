import neo4j from 'neo4j-driver'
import { loadEnvFromNearest } from '@/shared/config.util.mjs'

// 加载环境变量（从调用方所在目录向上查找 .env 文件）
export const envFilePath = loadEnvFromNearest(import.meta.url)
console.log(`加载环境变量文件：${envFilePath}`)

// 连接信息（从根目录 .env 读取，和 docker-compose 保持一致）
const driver = neo4j.driver(
  `bolt://${process.env.NEO4J_HOST || 'localhost'}:${process.env.NEO4J_BOLT_PORT || 7687}`,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
)

/**
 * 执行 Cypher 查询的通用方法
 * 每次调用创建独立 session，避免事务冲突
 */
async function runCypher(cypher) {
  const session = driver.session()
  try {
    return await session.run(cypher)
  } finally {
    await session.close()
  }
}

// 1. 执行创建节点（示例）
async function createData() {
  const result = await runCypher(`
    CREATE (p:Product {name: "珍珠奶茶"})
    CREATE (i:Ingredient {name: "珍珠"})
    RETURN p, i
  `)
  result.records.forEach(record => {
    console.log(
      '创建节点:',
      record.get('p').properties.name,
      record.get('i').properties.name,
    )
  })
  console.log(
    `创建成功，共 ${result.summary.counters.updates().nodesCreated} 个节点`,
  )
}

// 2. 执行创建关系（示例）
async function createRelation() {
  const result = await runCypher(`
    MATCH (p:Product {name: "珍珠奶茶"}), (i:Ingredient {name: "珍珠"})
    CREATE (p)-[r:包含]->(i)
    RETURN p.name AS from, type(r) AS rel, i.name AS to
  `)
  result.records.forEach(record => {
    console.log(
      `关系: ${record.get('from')} -[${record.get('rel')}]-> ${record.get('to')}`,
    )
  })
  console.log(
    `关系创建成功，共 ${result.summary.counters.updates().relationshipsCreated} 条`,
  )
}

// 3. 查询数据
async function queryData() {
  const result = await runCypher(`
    MATCH (p:Product {name: "珍珠奶茶"})-[r]->(i)
    RETURN p, r, i
  `)
  result.records.forEach(record => {
    console.log('奶茶:', record.get('p').properties.name)
    console.log('关系:', record.get('r').type)
    console.log('配料:', record.get('i').properties.name)
    console.log('--------------------------------')
  })
}

// 4. 更新属性
async function updateData() {
  const result = await runCypher(`
    MATCH (p:Product {name: "珍珠奶茶"})
    SET p.price = 15, p.calorie = "中高"
    RETURN p
  `)
  result.records.forEach(record => {
    console.log(
      '更新后属性:',
      JSON.stringify(record.get('p').properties, null, 2),
    )
  })
  console.log(
    `更新成功，影响 ${result.summary.counters.updates().propertiesSet} 个属性`,
  )
}

// 5. 删除关系
async function deleteRelation() {
  const result = await runCypher(`
    MATCH (p:Product {name: "珍珠奶茶"})-[r:包含]->(i:Ingredient {name: "珍珠"})
    DELETE r
  `)
  console.log(
    `删除关系成功，共删除 ${result.summary.counters.updates().relationshipsDeleted} 条关系`,
  )
}

// 6. 删除节点
async function deleteNode() {
  const result = await runCypher(`
    MATCH (p:Product {name: "珍珠奶茶"})
    DELETE p
  `)
  console.log(
    `删除节点成功，共删除 ${result.summary.counters.updates().nodesDeleted} 个节点`,
  )
}

// 7. 删除所有节点和关系（本地测试用）
async function deleteAll() {
  const result = await runCypher(`
    MATCH (n) DETACH DELETE n RETURN count(n) AS deletedCount
  `)
  const deletedCount = result.records[0].get('deletedCount').toNumber()
  console.log(`已删除所有节点，共 ${deletedCount} 个`)
}

// 执行（你想运行哪个就打开哪个）
async function main() {
  try {
    await createData()
    await createRelation()
    await queryData()
    await updateData()
    await deleteRelation()
    await deleteNode()
    // await deleteAll()
  } finally {
    await driver.close()
  }
}

main()
