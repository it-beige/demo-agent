import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import chalk from 'chalk'
import 'dotenv/config'
import { runToolAgent } from './tool-runner.mjs'
import { createTools } from './tools/index.mjs'

const model = new ChatOpenAI({
  model: process.env.MODEL,
  apiKey: process.env.API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.BASE_URL,
  },
})
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.EMBEDDING_API_KEY,
  model: process.env.EMBEDDING_MODEL,
  configuration: {
    baseURL: process.env.EMBEDDING_BASE_URL,
  },
  dimensions: parseInt(process.env.EMBEDDING_DIM),
})

export { model, embeddings }

export async function runAgentWithTools(query, maxIterations = 30) {
  const messages = [
    new SystemMessage(`你是一个项目管理助手，使用工具完成任务。
    
    当前工作目录: ${process.cwd()}
    
    工具：
    1. file-read: 读取文件
    2. file-write: 写入文件
    3. command-execute: 执行命令（支持 workingDirectory 参数）
    4. directory-list: 列出目录
    
    重要规则 - command-execute：
    - workingDirectory 参数会自动切换到指定目录
    - 当使用 workingDirectory 时，绝对不要在 command 中使用 cd
    - 错误示例: { command: "cd react-todo-app && pnpm install", workingDirectory: "react-todo-app" }
    - 正确示例: { command: "pnpm install", workingDirectory: "react-todo-app" }
    
    回复要简洁，只说做了什么`),
    new HumanMessage(query),
  ]

  console.log(chalk.bgGreen('⏳ 正在等待 AI 思考...'))

  const response = await runToolAgent({
    model,
    tools: createTools(),
    messages,
    maxIterations,
  })

  if (response.content) {
    console.log(chalk.bgCyan(`\n✨ AI 最终回复:\n${response.content}\n`))
  }

  return response.content
}
