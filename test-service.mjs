import 'dotenv/config'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import chalk from 'chalk'

console.log(chalk.bgBlue('🔍 开始测试服务配置...\n'))

// 测试 1: 检查环境变量
console.log(chalk.bgCyan('✅ 步骤 1: 检查环境变量配置'))
const requiredEnvVars = [
  'API_KEY',
  'BASE_URL',
  'MODEL',
  'EMBEDDING_API_KEY',
  'EMBEDDING_BASE_URL',
  'EMBEDDING_MODEL',
  'EMBEDDING_DIM',
]

let allEnvVarsPresent = true
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar]
  if (value) {
    console.log(chalk.green(`  ✓ ${envVar}: 已配置`))
  } else {
    console.log(chalk.red(`  ✗ ${envVar}: 未配置`))
    allEnvVarsPresent = false
  }
}

if (!allEnvVarsPresent) {
  console.log(chalk.bgRed('\n❌ 环境变量配置不完整，请检查 .env 文件'))
  process.exit(1)
}

console.log(chalk.green('\n✅ 所有环境变量配置完整\n'))

// 测试 2: 测试 LLM 模型连接
console.log(chalk.bgCyan('✅ 步骤 2: 测试 LLM 模型连接'))
const model = new ChatOpenAI({
  model: process.env.MODEL,
  apiKey: process.env.API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.BASE_URL,
  },
})

try {
  const response = await model.invoke('你好，请用一句话回复')
  console.log(chalk.green(`  ✓ LLM 连接成功`))
  console.log(chalk.gray(`  回复：${response.content}\n`))
} catch (error) {
  console.log(chalk.red(`  ✗ LLM 连接失败：${error.message}`))
  console.log(chalk.bgRed('\n❌ LLM 服务不可用'))
  process.exit(1)
}

// 测试 3: 测试 Embedding 模型连接
console.log(chalk.bgCyan('✅ 步骤 3: 测试 Embedding 模型连接'))
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.EMBEDDING_API_KEY,
  model: process.env.EMBEDDING_MODEL,
  configuration: {
    baseURL: process.env.EMBEDDING_BASE_URL,
  },
  dimensions: parseInt(process.env.EMBEDDING_DIM),
})

try {
  const result = await embeddings.embedQuery('测试文本')
  console.log(chalk.green(`  ✓ Embedding 连接成功`))
  console.log(chalk.gray(`  向量维度：${result.length}\n`))
} catch (error) {
  console.log(chalk.red(`  ✗ Embedding 连接失败：${error.message}`))
  console.log(chalk.bgRed('\n❌ Embedding 服务不可用'))
  process.exit(1)
}

console.log(chalk.bgGreen('\n🎉 所有服务测试通过！服务可以正常使用\n'))
