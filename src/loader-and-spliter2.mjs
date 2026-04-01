import 'dotenv/config'
import 'cheerio'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { tool } from '@langchain/core/tools'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { z } from 'zod'

import { runToolAgent } from './tool-runner.mjs'

const EMBEDDING_MODEL_ALIASES = {
  'text-embedding-v3': 'text-embedding-3-small',
}

const embeddingsModel =
  EMBEDDING_MODEL_ALIASES[process.env.EMBEDDINGS_MODEL] ??
  process.env.EMBEDDINGS_MODEL ??
  'text-embedding-3-small'
const embeddingsApiKey = process.env.EMBEDDINGS_API_KEY ?? process.env.API_KEY
const embeddingsBaseURL =
  process.env.EMBEDDINGS_BASE_URL ?? process.env.BASE_URL

const model = new ChatOpenAI({
  temperature: 0,
  model: process.env.MODEL,
  apiKey: process.env.API_KEY,
  configuration: {
    baseURL: process.env.BASE_URL,
  },
})

const embeddings = new OpenAIEmbeddings({
  apiKey: embeddingsApiKey,
  model: embeddingsModel,
  configuration: {
    baseURL: embeddingsBaseURL,
  },
})

function normalizeSearchText(text) {
  return text.replace(/[\s\p{P}\p{S}]+/gu, '').toLowerCase()
}

function getBigrams(text) {
  const grams = new Set()
  for (let i = 0; i < text.length - 1; i += 1) {
    grams.add(text.slice(i, i + 2))
  }
  return grams
}

function scoreDocumentByKeywords(query, content) {
  const normalizedQuery = normalizeSearchText(query)
  const normalizedContent = normalizeSearchText(content)

  if (!normalizedQuery || !normalizedContent) return 0

  let score = 0

  if (normalizedContent.includes(normalizedQuery)) {
    score += normalizedQuery.length * 3
  }

  for (const gram of getBigrams(normalizedQuery)) {
    if (normalizedContent.includes(gram)) score += 3
  }

  for (const char of new Set(normalizedQuery)) {
    if (normalizedContent.includes(char)) score += 1
  }

  return score
}

async function createRetrievalBackend(documentsToRetrieve) {
  try {
    console.log('正在创建向量存储...')
    await embeddings.embedQuery('embedding health check')
    const vectorStore = await MemoryVectorStore.fromDocuments(
      documentsToRetrieve,
      embeddings,
    )
    console.log('向量存储创建完成\n')

    return {
      mode: 'vector',
      async retrieve(query, k) {
        const retriever = vectorStore.asRetriever({ k })
        const retrievedDocs = await retriever.invoke(query)
        const scoredResults = await vectorStore.similaritySearchWithScore(query, k)

        return retrievedDocs.map(doc => {
          const scoredResult = scoredResults.find(
            ([scoredDoc]) => scoredDoc.pageContent === doc.pageContent,
          )
          const score = scoredResult ? scoredResult[1] : null
          const similarity = score !== null ? (1 - score).toFixed(4) : 'N/A'

          return {
            doc,
            scoreLabel: `相似度: ${similarity}`,
          }
        })
      },
    }
  } catch (error) {
    console.warn(
      [
        'Embeddings 不可用，已自动切换为关键词检索。',
        `原因: ${error.message}`,
      ].join('\n'),
    )

    return {
      mode: 'keyword',
      async retrieve(query, k) {
        const rankedResults = documentsToRetrieve
          .map(doc => ({
            doc,
            score: scoreDocumentByKeywords(query, doc.pageContent),
          }))
          .sort((left, right) => right.score - left.score)
          .slice(0, k)

        return rankedResults.map(({ doc, score }) => ({
          doc,
          scoreLabel: `关键词匹配分: ${score}`,
        }))
      },
    }
  }
}

const cheerioLoader = new CheerioWebBaseLoader(
  'https://juejin.cn/post/7233327509919547452',
  {
    selector: '.main-area p',
  },
)

const documents = await cheerioLoader.load()

console.assert(documents.length === 1)
console.log(`Total characters: ${documents[0].pageContent.length}`)

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500, // 每个分块的字符数
  chunkOverlap: 50, // 分块之间的重叠字符数
  separators: ['。', '！', '？'], // 分割符，优先使用段落分隔
})

const splitDocuments = await textSplitter.splitDocuments(documents)

console.log(`文档分割完成，共 ${splitDocuments.length} 个分块\n`)

const retrievalBackend = await createRetrievalBackend(splitDocuments)
console.log(`当前检索模式: ${retrievalBackend.mode}\n`)

const questions = ['父亲的去世对作者的人生态度产生了怎样的根本性逆转？']

const ragRetrieveTool = tool(
  async ({ query, k = 2 }) => {
    const retrievedResults = await retrievalBackend.retrieve(query, k)

    const context = retrievedResults
      .map(({ doc, scoreLabel }, i) => {
        return `[片段${i + 1}] ${scoreLabel}\n${doc.pageContent}`
      })
      .join('\n\n━━━━━\n\n')

    if (!context) return '未检索到相关内容。'

    return `检索模式：${retrievalBackend.mode}\n\n文章内容：\n${context}`
  },
  {
    name: 'rag-retrieve',
    description:
      '基于向量库检索与问题最相关的文章片段，返回可直接引用的上下文（包含相似度信息）。回答问题前应先调用此工具获取上下文。',
    schema: z.object({
      query: z.string().describe('要检索的问题/查询'),
      k: z.number().int().min(1).max(8).optional().describe('返回片段数量'),
    }),
  },
)

// RAG 流程：对每个问题进行检索和回答
for (const question of questions) {
  console.log('='.repeat(80))
  console.log(`问题: ${question}`)
  console.log('='.repeat(80))

  console.log('\n【AI 回答】')

  const messages = [
    new SystemMessage(
      [
        '你是一个文章辅助阅读助手，需要基于文章内容回答问题。',
        '在回答之前，必须先调用 rag-retrieve 工具获取与问题相关的文章片段上下文。',
        '拿到上下文后，再给出简洁、准确的回答；如果上下文不足以支持结论，请明确说明不确定并给出基于上下文的最合理推断。',
      ].join('\n'),
    ),
    new HumanMessage(question),
  ]

  const response = await runToolAgent({
    model,
    tools: [ragRetrieveTool],
    messages,
    maxIterations: 10,
  })
  void response
  console.log('\n')
}
