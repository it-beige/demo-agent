/**
 * 测试 DashScope text-embedding-async-v2 模型兼容性
 */

import DashScopeEmbeddings from './src/embeddings/dashscope-embeddings.mjs'

// 从环境变量获取 API Key（支持多种命名方式）
const apiKey = process.env.EMBEDDING_API_KEY || process.env.API_KEY || process.env.DASHSCOPE_API_KEY

if (!apiKey) {
  console.error('❌ 错误: 请设置以下环境变量之一:')
  console.log('   - EMBEDDING_API_KEY')
  console.log('   - API_KEY')
  console.log('   - DASHSCOPE_API_KEY')
  process.exit(1)
}

// 测试同步模型 text-embedding-v2
async function testSyncModel() {
  console.log('\n🧪 测试同步模型: text-embedding-v2')
  console.log('='.repeat(50))
  
  const embeddings = new DashScopeEmbeddings({
    apiKey,
    model: 'text-embedding-v2',
    dimensions: 1536
  })
  
  try {
    const result = await embeddings.embedQuery('这是一个测试文本')
    console.log('✅ 成功! 向量维度:', result.length)
    console.log('前5个值:', result.slice(0, 5).map(v => v.toFixed(4)))
    return true
  } catch (error) {
    console.error('❌ 失败:', error.message)
    return false
  }
}

// 测试异步模型 text-embedding-async-v2
async function testAsyncModel() {
  console.log('\n🧪 测试异步模型: text-embedding-async-v2')
  console.log('='.repeat(50))
  
  const embeddings = new DashScopeEmbeddings({
    apiKey,
    model: 'text-embedding-async-v2',
    dimensions: 1536,
    pollingInterval: 2000,  // 2秒轮询一次
    maxRetries: 30          // 最多轮询30次（60秒超时）
  })
  
  try {
    const result = await embeddings.embedQuery('这是一个测试文本')
    console.log('✅ 成功! 向量维度:', result.length)
    console.log('前5个值:', result.slice(0, 5).map(v => v.toFixed(4)))
    return true
  } catch (error) {
    console.error('❌ 失败:', error.message)
    return false
  }
}

// 主函数
async function main() {
  console.log('🚀 DashScope Embedding 模型兼容性测试\n')
  
  const syncResult = await testSyncModel()
  const asyncResult = await testAsyncModel()
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 测试结果汇总')
  console.log('='.repeat(50))
  console.log(`text-embedding-v2 (同步): ${syncResult ? '✅ 可用' : '❌ 不可用'}`)
  console.log(`text-embedding-async-v2 (异步): ${asyncResult ? '✅ 可用' : '❌ 不可用'}`)
  
  if (!asyncResult) {
    console.log('\n💡 提示: 异步模型适用于大批量文本向量化场景')
    console.log('   代码已支持自动轮询获取结果')
  }
}

main().catch(console.error)
