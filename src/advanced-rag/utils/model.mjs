import { loadEnvFromNearest } from './config.util.mjs'
import { ChatOpenAI } from '@langchain/openai'
import DashScopeEmbeddings from '@/embeddings/dashscope-embeddings.mjs'

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

// 使用阿里云原生 API 实现 Embedding（替代 OpenAIEmbeddings）
export const embeddings = new DashScopeEmbeddings({
  apiKey: process.env.EMBEDDING_API_KEY,
  model: process.env.EMBEDDING_MODEL,
  dimensions: parseInt(process.env.EMBEDDING_DIM) || 1536,
})

// 注释掉的 OpenAIEmbeddings 实现（备用）
// export const embeddings = new OpenAIEmbeddings({
//   model: process.env.EMBEDDING_MODEL,
//   dimensions: parseInt(process.env.EMBEDDING_DIM),
//   apiKey: process.env.EMBEDDING_API_KEY,
//   configuration: {
//     baseURL: process.env.EMBEDDING_BASE_URL,
//   },
// })
