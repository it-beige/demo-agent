import 'dotenv/config'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Document } from '@langchain/core/documents'
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory'

const RETRIEVE_TOP_K = 3

const embeddingsModel = process.env.EMBEDDING_MODEL
const embeddingsBaseURL = process.env.EMBEDDING_BASE_URL
const embeddingsApiKey = process.env.EMBEDDING_API_KEY
const embeddingsDimensions = process.env.EMBEDDING_DIM
  ? Number(process.env.EMBEDDING_DIM)
  : undefined

const model = {
  async invoke(prompt) {
    const response = await fetch(`${process.env.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.MODEL,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(
        `Chat 请求失败: ${response.status} ${response.statusText}\n${await response.text()}`,
      )
    }

    const data = await response.json()

    return {
      content: data.choices?.[0]?.message?.content ?? '',
    }
  },
}

const embeddings = new OpenAIEmbeddings({
  apiKey: embeddingsApiKey,
  model: embeddingsModel,
  configuration: {
    baseURL: embeddingsBaseURL,
  },
  dimensions: embeddingsDimensions,
})

async function ensureEmbeddingsReady() {
  if (!embeddingsBaseURL) {
    throw new Error('缺少 EMBEDDING_BASE_URL，无法连接 embeddings 服务。')
  }

  if (!embeddingsApiKey) {
    throw new Error('缺少 EMBEDDING_API_KEY，无法调用 embeddings 服务。')
  }

  if (!embeddingsModel) {
    throw new Error('缺少 EMBEDDING_MODEL，无法确定 embeddings 模型。')
  }

  try {
    await embeddings.embedQuery('embedding health check')
  } catch (error) {
    throw new Error(
      [
        'Embeddings 链路不可用。',
        `当前 embeddings base URL: ${embeddingsBaseURL}`,
        `当前 embeddings model: ${embeddingsModel}`,
        '这个服务需要是 OpenAI 兼容且支持 POST /embeddings 的接口。',
        'embeddings 走的是独立配置，请检查 .env 里的 EMBEDDING_BASE_URL、EMBEDDING_API_KEY、EMBEDDING_MODEL、EMBEDDING_DIM。',
        `原始错误: ${error.message}`,
      ].join('\n'),
    )
  }
}

function getResponseText(content) {
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .filter(item => item.type === 'text' && item.text)
      .map(item => item.text)
      .join('\n')
  }

  return String(content)
}

// 从回答里解析出【片段N】标注，区分有效引用和越界（模型编造）的编号
function collectCitations(answer, total) {
  const cited = []
  const invalid = []

  for (const match of answer.matchAll(/【片段(\d+)】/g)) {
    const index = Number(match[1])

    if (index >= 1 && index <= total) {
      if (!cited.includes(index)) {
        cited.push(index)
      }
    } else if (!invalid.includes(index)) {
      invalid.push(index)
    }
  }

  return { cited: cited.sort((a, b) => a - b), invalid }
}

const documents = [
  new Document({
    pageContent: `光光是一个活泼开朗的小男孩，他有一双明亮的大眼睛，总是带着灿烂的笑容。光光最喜欢的事情就是和朋友们一起玩耍，他特别擅长踢足球，每次在球场上奔跑时，就像一道阳光一样充满活力。`,
    metadata: {
      chapter: 1,
      character: '光光',
      type: '角色介绍',
      mood: '活泼',
    },
  }),
  new Document({
    pageContent: `东东是光光最好的朋友，他是一个安静而聪明的男孩。东东喜欢读书和画画，他的画总是充满了想象力。虽然性格不同，但东东和光光从幼儿园就认识了，他们一起度过了无数个快乐的时光。`,
    metadata: {
      chapter: 2,
      character: '东东',
      type: '角色介绍',
      mood: '温馨',
    },
  }),
  new Document({
    pageContent: `有一天，学校要举办一场足球比赛，光光非常兴奋，他邀请东东一起参加。但是东东从来没有踢过足球，他担心自己会拖累光光。光光看出了东东的担忧，他拍着东东的肩膀说："没关系，我们一起练习，我相信你一定能行的！"`,
    metadata: {
      chapter: 3,
      character: '光光和东东',
      type: '友情情节',
      mood: '鼓励',
    },
  }),
  new Document({
    pageContent: `接下来的日子里，光光每天放学后都会教东东踢足球。光光耐心地教东东如何控球、传球和射门，而东东虽然一开始总是踢不好，但他从不放弃。东东也用自己的方式回报光光，他画了一幅画送给光光，画上是两个小男孩在球场上一起踢球的场景。`,
    metadata: {
      chapter: 4,
      character: '光光和东东',
      type: '友情情节',
      mood: '互助',
    },
  }),
  new Document({
    pageContent: `比赛那天终于到了，光光和东东一起站在球场上。虽然东东的技术还不够熟练，但他非常努力，而且他用自己的观察力帮助光光找到了对手的弱点。在关键时刻，东东传出了一个漂亮的球，光光接球后射门得分！他们赢得了比赛，更重要的是，他们的友谊变得更加深厚了。`,
    metadata: {
      chapter: 5,
      character: '光光和东东',
      type: '高潮转折',
      mood: '激动',
    },
  }),
  new Document({
    pageContent: `从那以后，光光和东东成为了学校里最要好的朋友。光光教东东运动，东东教光光画画，他们互相学习，共同成长。每当有人问起他们的友谊，他们总是笑着说："真正的朋友就是互相帮助，一起变得更好的人！"`,
    metadata: {
      chapter: 6,
      character: '光光和东东',
      type: '结局',
      mood: '欢乐',
    },
  }),
  new Document({
    pageContent: `多年后，光光成为了一名职业足球运动员，而东东成为了一名优秀的插画师。虽然他们走上了不同的道路，但他们的友谊从未改变。东东为光光设计了球衣上的图案，光光在每场比赛后都会给东东打电话分享喜悦。他们证明了，真正的友情可以跨越时间和距离，永远闪闪发光。`,
    metadata: {
      chapter: 7,
      character: '光光和东东',
      type: '尾声',
      mood: '温馨',
    },
  }),
]

await ensureEmbeddingsReady()

const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings)
const retriever = vectorStore.asRetriever({ k: RETRIEVE_TOP_K })

const questions = ['东东和光光是怎么成为朋友的？']

for (const question of questions) {
  console.log('='.repeat(80))
  console.log(`问题: ${question}`)
  console.log('='.repeat(80))
  console.log('检索方式: 向量检索')

  const retrievedDocs = await retriever.invoke(question)
  const scoredResults = await vectorStore.similaritySearchWithScore(
    question,
    RETRIEVE_TOP_K,
  )

  // 打印用到的文档和相似度评分
  console.log('\n【检索到的文档及相似度】')
  retrievedDocs.forEach((doc, i) => {
    const scoredResult = scoredResults.find(
      ([scoredDoc]) => scoredDoc.pageContent === doc.pageContent,
    )
    // MemoryVectorStore 默认返回余弦相似度，直接使用即可
    const similarity = scoredResult ? Number(scoredResult[1].toFixed(4)) : null
    console.log(`\n[文档 ${i + 1}] 相似度: ${similarity ?? 'N/A'}`)
    console.log(`内容: ${doc.pageContent}`)
    console.log(
      `元数据: 章节=${doc.metadata.chapter}, 角色=${doc.metadata.character}, 类型=${doc.metadata.type}, 心情=${doc.metadata.mood}`,
    )
  })

  // 构建 prompt：片段编号带上章节，方便人工核对引用是否合理
  const context = retrievedDocs
    .map(
      (doc, i) =>
        `[片段${i + 1}]（第${doc.metadata.chapter}章）\n${doc.pageContent}`,
    )
    .join('\n\n━━━━━\n\n')

  const prompt = `你是一个讲友情故事的老师。基于以下故事片段回答问题，用温暖生动的语言。如果故事中没有提到，就说"这个故事里还没有提到这个细节"。

引用要求:
1. 每一句基于故事片段的话，都要在句末用【片段N】标注来源，N 是下面片段的编号。
2. 一句话同时用到多个片段时，把编号都标出来，例如【片段1】【片段3】。
3. 只能使用 1 到 ${retrievedDocs.length} 之间的编号，不要编造不存在的片段。
4. 片段里没有依据的内容不要写，也不要给它加标注。

故事片段:
${context}

问题: ${question}

老师的回答:`

  console.log('\n【AI 回答】')
  const response = await model.invoke(prompt)
  const answer = getResponseText(response.content)
  console.log(answer)

  // 引用溯源：把回答里的【片段N】映射回原始文档，便于核查答案是否有据可依
  const { cited, invalid } = collectCitations(answer, retrievedDocs.length)

  console.log('\n【引用溯源】')
  if (cited.length === 0) {
    console.log('回答中没有出现【片段N】标注，无法溯源。')
  } else {
    cited.forEach(index => {
      const doc = retrievedDocs[index - 1]
      console.log(
        `片段${index} -> 第${doc.metadata.chapter}章 | 角色=${doc.metadata.character} | 类型=${doc.metadata.type}`,
      )
      console.log(`  原文: ${doc.pageContent}`)
    })

    const unused = retrievedDocs
      .map((_, i) => i + 1)
      .filter(index => !cited.includes(index))
    if (unused.length > 0) {
      console.log(`未被引用的片段: ${unused.map(i => `片段${i}`).join('、')}`)
    }
  }

  if (invalid.length > 0) {
    console.log(
      `⚠️ 回答中出现了不存在的片段编号: ${invalid.join('、')}（有效范围 1-${retrievedDocs.length}）`,
    )
  }

  console.log('\n')
}
