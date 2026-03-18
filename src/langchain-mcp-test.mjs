import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { MultiServerMCPClient } from '@langchain/mcp-adapters'
import { model } from './index.mjs'
import { runToolAgent } from './tool-runner.mjs'
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
    const content = await mcpClient.readResource(serverName, resource.uri)
    resourceContent += content[0].text
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
