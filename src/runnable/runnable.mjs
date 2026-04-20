import 'dotenv/config'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { PromptTemplate } from '@langchain/core/prompts'
import { model } from '@/index.mjs'
import { RunnableSequence, RunnableLambda } from '@langchain/core/runnables'
import { z } from 'zod'

// 定义输出结构 schema
const schema = z.object({
  translation: z.string().describe('翻译后的英文文本'),
  keywords: z.array(z.string()).length(3).describe('3个关键词'),
})

const outputParser = StructuredOutputParser.fromZodSchema(schema)

const promptTemplate = PromptTemplate.fromTemplate(
  '将以下文本翻译成英文，然后总结为3个关键词。\n\n文本：{text}\n\n{format_instructions}',
)

// const chain = promptTemplate
//     .pipe(model)
//     .pipe(outputParser);
const logInput = RunnableLambda.from(input => {
  console.log('输入:', input)
  return input
})

const logOutput = RunnableLambda.from(output => {
  console.log('输出:', output)
  return output
})

const chain = RunnableSequence.from([
  logInput,
  promptTemplate,
  model,
  outputParser,
  logOutput,
])

const input = {
  text: 'LangChain 是一个强大的 AI 应用开发框架',
  format_instructions: outputParser.getFormatInstructions(),
}

const result = await chain.invoke(input)

console.log('✅ 最终结果:')
console.log(result)
