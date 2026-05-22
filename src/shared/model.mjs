import { loadEnvFromNearest } from './config.util.mjs'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'

// 加载环境变量（从调用方所在目录向上查找 .env 文件）
export const envFilePath = loadEnvFromNearest(import.meta.url)
console.log(`加载环境变量文件：${envFilePath}`)

/**
 * 创建 ChatOpenAI 模型实例
 * @param {object} [overrides] 覆盖默认配置的参数
 * @param {number} [overrides.temperature] 温度，默认 0.7
 * @returns {ChatOpenAI}
 */
export function createModel(overrides = {}) {
  return new ChatOpenAI({
    model: process.env.MODEL,
    apiKey: process.env.API_KEY,
    temperature: 0.7,
    configuration: {
      baseURL: process.env.BASE_URL,
    },
    ...overrides,
  })
}

/**
 * 创建 OpenAI 兼容模式的 Embedding 实例
 * 使用 text-embedding-v3 模型
 * @param {object} [overrides] 覆盖默认配置的参数
 * @returns {OpenAIEmbeddings}
 */
export function createEmbeddings(overrides = {}) {
  return new OpenAIEmbeddings({
    apiKey: process.env.EMBEDDING_API_KEY,
    model: process.env.EMBEDDING_MODEL || 'text-embedding-v3',
    dimensions: parseInt(process.env.EMBEDDING_DIM) || 1024,
    configuration: {
      baseURL: process.env.EMBEDDING_BASE_URL,
    },
    ...overrides,
  })
}

// 默认单例导出，满足大多数场景直接使用
export const model = createModel()
export const embeddings = createEmbeddings()
