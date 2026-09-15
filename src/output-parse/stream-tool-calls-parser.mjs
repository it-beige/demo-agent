import 'dotenv/config'
import { model } from '@/index.mjs'
import { JsonOutputToolsParser } from '@langchain/core/output_parsers/openai_tools'
import { z } from 'zod'

// 定义结构化输出的 schema
const scientistSchema = z.object({
  name: z.string().describe('科学家的全名'),
  birth_year: z.number().describe('出生年份'),
  death_year: z.number().optional().describe('去世年份，如果还在世则不填'),
  nationality: z.string().describe('国籍'),
  fields: z.array(z.string()).describe('研究领域列表'),
  achievements: z.array(z.string()).describe('主要成就'),
  biography: z.string().describe('简短传记'),
})

// 绑定工具到模型
const modelWithTool = model.bindTools([
  {
    name: 'extract_scientist_info',
    description: '提取和结构化科学家的详细信息',
    schema: scientistSchema,
  },
])

// 1. 绑定工具并挂载解析器
const parser = new JsonOutputToolsParser()
const chain = modelWithTool.pipe(parser)

try {
  // 2. 开启流
  const stream = await chain.stream('详细介绍牛顿的生平和成就')

  let finalResult = null // 存储最终的完整结果

  for await (const chunk of stream) {
    // console.log(chunk);

    if (chunk.length > 0) {
      const toolCall = chunk[0]

      // 保存当前已拼接出的完整参数对象
      finalResult = toolCall.args || {}

      // 每来一个分片，就把当前完整的 JSON 重新渲染一遍（刷新终端）
      // 这样能看到 JSON 结构被连贯地、逐步拼接生长出来
      console.clear()
      console.log('📡 实时输出流式内容（JSON 正在拼接）:\n')
      console.log(JSON.stringify(finalResult, null, 2))
    }
  }

  console.log('\n✅ 流式输出完成')
  console.log('📊 最终结果:', finalResult)
} catch (error) {
  console.error('\n❌ 错误:', error.message)
  console.error(error)
}
