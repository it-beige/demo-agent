import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { MultiServerMCPClient } from '@langchain/mcp-adapters'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

import { model } from '../index.mjs'
import { runToolAgent } from '../tool-runner.mjs'

function getAllowedPaths() {
  return (process.env.ALLOWED_PATHS ?? '')
    .split(',')
    .map(path => path.trim())
    .filter(Boolean)
}

function getResponseText(content) {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map(item => {
        if (typeof item === 'string') return item
        if (item?.type === 'text') return item.text ?? ''
        return JSON.stringify(item)
      })
      .join('\n')
  }
  return String(content ?? '')
}

function createAmapClient() {
  const allowedPaths = getAllowedPaths()

  return new MultiServerMCPClient({
    mcpServers: {
      'amap-maps': {
        command: 'npx',
        args: ['-y', '@amap/amap-maps-mcp-server'],
        env: {
          AMAP_MAPS_API_KEY: process.env.AMAP_MAPS_API_KEY,
        },
      },
      ...(allowedPaths.length > 0
        ? {
            filesystem: {
              command: 'npx',
              args: [
                '-y',
                '@modelcontextprotocol/server-filesystem',
                ...allowedPaths,
              ],
            },
          }
        : {}),

      'chrome-devtools': {
        command: '/Users/chenkun/.nvm/versions/node/v22.22.1/bin/npx',
        args: ['-y', 'chrome-devtools-mcp@latest'],
        env: {
          PATH: '/Users/chenkun/.nvm/versions/node/v22.22.1/bin:/usr/bin:/bin:/usr/sbin:/sbin',
        },
      },
    },
  })
}

export async function runAmapAgent(query, maxIterations = 30) {
  const mcpClient = createAmapClient()

  try {
    const tools = await mcpClient.getTools()
    const allowedPaths = getAllowedPaths()
    const messages = [
      new SystemMessage(
        [
          '你是一个高德地图与文件助手。',
          '涉及地点、路线、POI 时，优先调用地图相关工具获取信息。',
          '涉及本地文件读取、列目录、写文件时，优先调用 filesystem 相关工具。',
          allowedPaths.length > 0
            ? `当前允许访问的本地路径：${allowedPaths.join('、')}`
            : '当前未配置允许访问的本地路径。',
          '在工具返回结果后，再给出简洁、准确的中文回答。',
          '如果工具结果不足以支持结论，请明确说明不确定。',
        ].join('\n'),
      ),
      new HumanMessage(query),
    ]

    const response = await runToolAgent({
      model,
      tools,
      messages,
      maxIterations,
    })

    return getResponseText(response.content)
  } finally {
    await mcpClient.close()
  }
}

const currentFilePath = fileURLToPath(import.meta.url)

if (process.argv[1] === currentFilePath) {
  const query =
    process.argv.slice(2).join(' ') || '查一下杭州西湖附近适合散步的景点。'

  const result = await runAmapAgent(query)

  if (result) {
    console.log(`\n✨ AI 最终回复:\n${result}\n`)
  }
}
