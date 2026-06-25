import { createModel } from '@/shared/model.mjs'
import {
  trimMessages,
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages'

const model = createModel({ temperature: 0 })

// 把 maxInputTokens 覆盖为 1024，模拟上下文受限的场景
Object.defineProperty(model, 'profile', {
  get: () => ({ maxInputTokens: 1_024 }),
})
const MAX_TOKENS = model.profile.maxInputTokens

// ─────────────────────────────────────────────
// 构造一段"超出上下文窗口"的长对话
// ─────────────────────────────────────────────
const longParagraph =
  '人工智能正在深刻改变我们的生活方式。从智能推荐到自动驾驶，从医疗诊断到金融风控，' +
  'AI 技术已经渗透到各行各业。随着大语言模型的快速发展，我们看到了前所未有的自然语言理解能力，' +
  '机器翻译的精度不断提升，智能客服已经能够处理越来越复杂的问题。' +
  '与此同时，多模态模型也在崛起，能够同时理解图像、文本和语音，为人机交互带来全新的可能。'

const messages = [
  new SystemMessage('你是一个有帮助的 AI 助手，请用简洁的中文回答问题。'),
  new HumanMessage(longParagraph),
  new AIMessage('收到，您提到了 AI 技术在各行业的应用，请问您想了解哪方面？'),
  new HumanMessage(longParagraph),
  new AIMessage('好的，我来为您详细介绍 AI 在医疗领域的应用……'),
  new HumanMessage(longParagraph),
  new AIMessage('关于自动驾驶，目前主流方案分为感知、决策和控制三个模块……'),
  new HumanMessage(longParagraph),
  new AIMessage(
    '您提到的大语言模型，目前主流的训练方法包括预训练和微调两个阶段……',
  ),
  new HumanMessage('请帮我总结以上所有内容的核心要点。'),
]

// ─────────────────────────────────────────────
// 压缩前：估算 token 数量
// ─────────────────────────────────────────────
const totalTokensBefore = await model.getNumTokens(
  messages.map(m => m.content).join('\n'),
)
console.log(
  `压缩前：${messages.length} 条消息，约 ${totalTokensBefore} tokens（上限 ${MAX_TOKENS}）`,
)

// ─────────────────────────────────────────────
// 使用 trimMessages 进行上下文压缩
//   strategy: "last"  → 保留最近的对话（丢弃最早的）
//   includeSystem     → 始终保留 SystemMessage
//   tokenCounter      → 直接用 model 内置的 tokenizer
// ─────────────────────────────────────────────
const trimmed = await trimMessages(messages, {
  maxTokens: MAX_TOKENS,
  tokenCounter: model,
  strategy: 'last',
  includeSystem: true,
})

const totalTokensAfter = await model.getNumTokens(
  trimmed.map(m => m.content).join('\n'),
)
console.log(`压缩后：${trimmed.length} 条消息，约 ${totalTokensAfter} tokens`)

console.log('\n--- 压缩后保留的消息 ---')
trimmed.forEach((msg, i) => {
  const type = msg.constructor.name
  const preview =
    typeof msg.content === 'string'
      ? msg.content.slice(0, 60)
      : String(msg.content).slice(0, 60)
  console.log(`[${i}] ${type}: ${preview}...`)
})

// ─────────────────────────────────────────────
// 用压缩后的消息调用模型，验证可以正常响应
// ─────────────────────────────────────────────
console.log('\n正在调用模型（压缩后的上下文）...')
const response = await model.invoke(trimmed)
console.log('模型回复：', response.content)
