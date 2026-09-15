import { model } from '@/index.mjs'
import 'dotenv/config'

const prompt = `详细介绍莫扎特的信息。`

console.log('🌊 普通流式输出演示（无结构化）\n')

try {
  const stream = await model.stream(prompt)

  let fullContent = ''
  let reasoningContent = ''
  let chunkCount = 0
  let reasoningStarted = false
  let answerStarted = false

  console.log('📡 接收流式数据:\n')

  for await (const chunk of stream) {
    chunkCount++

    // 思考过程：推理模型会把思考内容放在 additional_kwargs.reasoning_content
    const reasoning = chunk.additional_kwargs?.reasoning_content || ''
    if (reasoning) {
      if (!reasoningStarted) {
        process.stdout.write('🤔 思考过程:\n')
        reasoningStarted = true
      }
      reasoningContent += reasoning
      process.stdout.write(reasoning) // 实时显示思考过程
    }

    // 正式回答内容
    const content = chunk.content
    if (content) {
      if (reasoningStarted && !answerStarted) {
        process.stdout.write('\n\n💬 正式回答:\n')
      }
      answerStarted = true
      fullContent += content
      process.stdout.write(content) // 实时显示流式文本
    }
  }

  console.log(`\n\n✅ 共接收 ${chunkCount} 个数据块\n`)
  console.log(`🤔 思考过程长度: ${reasoningContent.length} 字符`)
  console.log(`📝 完整内容长度: ${fullContent.length} 字符`)
} catch (error) {
  console.error('\n❌ 错误:', error.message)
}
