import { ToolMessage } from '@langchain/core/messages'

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
          content: toolResults[index],
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
