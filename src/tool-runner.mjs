import { ToolMessage } from '@langchain/core/messages'

// MCP 工具的返回值形态不统一：可能是字符串（如高德系工具）、content block 数组，
// 也可能是单个 { type: 'text', text } 对象（如 filesystem 系工具）。
// ToolMessage.content 必须是字符串或合法 content 数组，否则 @langchain/openai
// 在转换消息时会报 message.content.flatMap is not a function。
function normalizeToolContent(result) {
  if (typeof result === 'string') return result
  if (Array.isArray(result)) {
    return result.map(item => normalizeToolContent(item)).join('\n')
  }
  if (result && typeof result === 'object') {
    if (typeof result.text === 'string') return result.text
    return JSON.stringify(result)
  }
  return String(result ?? '')
}

export async function runToolAgent({
  model,
  tools,
  messages,
  maxIterations = 30,
}) {
  const modelWithTools = model.bindTools(tools)

  let response = await modelWithTools.invoke(messages)
  messages.push(response)
  let iteration = 0

  while (response.tool_calls && response.tool_calls.length > 0) {
    iteration += 1
    if (iteration > maxIterations) {
      throw new Error(`超过最大工具调用轮数限制: ${maxIterations}`)
    }

    console.log(`\n[检测到 ${response.tool_calls.length} 个工具调用]`)

    const toolResults = await Promise.all(
      response.tool_calls.map(async toolCall => {
        const selectedTool = tools.find(tool => tool.name === toolCall.name)
        if (!selectedTool) {
          return `错误: 找不到工具 ${toolCall.name}`
        }

        console.log(
          `[执行工具] ${toolCall.name}(${JSON.stringify(toolCall.args)})`,
        )

        try {
          return await selectedTool.invoke(toolCall.args)
        } catch (error) {
          const reason = `错误: ${error.message}`
          console.log(reason)
          return reason
        }
      }),
    )

    response.tool_calls.forEach((toolCall, index) => {
      messages.push(
        new ToolMessage({
          content: normalizeToolContent(toolResults[index]),
          tool_call_id: toolCall.id,
        }),
      )
    })

    response = await modelWithTools.invoke(messages)
    messages.push(response)
  }

  console.log('\n[最终回复]')
  console.log(response.content)

  return response
}
