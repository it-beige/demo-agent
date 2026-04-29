import { loadEnvFromNearest } from './config.util.mjs'
import { ChatOpenAI } from '@langchain/openai'

// 加载环境变量（从调用方所在目录向上查找 .env 文件）
export const envFilePath = loadEnvFromNearest(import.meta.url)
console.log(`加载环境变量文件：${envFilePath}`)

export const model = new ChatOpenAI({
  model: process.env.MODEL,
  apiKey: process.env.API_KEY,
  temperature: 0.7,
  configuration: {
    baseURL: process.env.BASE_URL,
  },
})
