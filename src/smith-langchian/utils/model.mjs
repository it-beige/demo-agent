import { loadEnvFromNearest } from '@/shared/config.util.mjs'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'

// 加载环境变量（从调用方所在目录向上查找 .env 文件）
export const envFilePath = loadEnvFromNearest(import.meta.url)
console.log(`加载环境变量文件：${envFilePath}`)

// LLM 模型
export const model = new ChatOpenAI({
  model: process.env.MODEL,
  apiKey: process.env.API_KEY,
  temperature: 0.7,
  configuration: {
    baseURL: process.env.BASE_URL,
  },
})

// Embedding 模型 - 使用 OpenAI 兼容模式（text-embedding-v3）
export const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.EMBEDDING_API_KEY,
  model: process.env.EMBEDDING_MODEL || 'text-embedding-v3',
  dimensions: parseInt(process.env.EMBEDDING_DIM) || 1024,
  configuration: {
    baseURL: process.env.EMBEDDING_BASE_URL,
  },
})
