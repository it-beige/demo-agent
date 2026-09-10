import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { MultiServerMCPClient } from '@langchain/mcp-adapters'
import { model } from '../index.mjs'
import { runToolAgent } from '../tool-runner.mjs'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

const mcpServerPath = fileURLToPath(
  new URL('./mcp-server.mjs', import.meta.url),
)

const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    'my-mcp-server': {
      command: 'node',
      args: [mcpServerPath],
    },
  },
})

const tools = await mcpClient.getTools()
const res = await mcpClient.listResources()

let resourceContent = ''
for (const [serverName, resources] of Object.entries(res)) {
  for (const resource of resources) {
    // 只注入文档类资源：把 data://users 也塞进上下文的话，模型拿到数据就不再调工具了
    if (!resource.uri.startsWith('docs://')) continue

    const contents = await mcpClient.readResource(serverName, resource.uri)
    for (const item of contents) {
      // 二进制资源只有 blob 没有 text，无法拼进提示词
      if (typeof item.text !== 'string') continue
      resourceContent += item.text
    }
  }
}
const messages = [
  new SystemMessage(resourceContent),
  new HumanMessage(
    '请先告诉我 MCP Server 的使用指南是什么，然后再查一下用户 002 的信息。',
  ),
]

await runToolAgent({
  model,
  tools,
  messages,
})
await mcpClient.close()
