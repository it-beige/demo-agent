import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

// 数据库
const database = {
  users: {
    '001': {
      id: '001',
      name: '张三',
      email: 'zhangsan@example.com',
      role: 'admin',
    },
    '002': { id: '002', name: '李四', email: 'lisi@example.com', role: 'user' },
    '003': {
      id: '003',
      name: '王五',
      email: 'wangwu@example.com',
      role: 'user',
    },
  },
}

const server = new McpServer({
  name: 'my-mcp-server',
  version: '1.0.0',
})

// 注册工具：查询用户信息
server.registerTool(
  'query_user',
  {
    description:
      '查询数据库中的用户信息。输入用户 ID，返回该用户的详细信息（姓名、邮箱、角色）。',
    inputSchema: {
      userId: z.string().describe('用户 ID，例如: 001, 002, 003'),
    },
  },
  async ({ userId }) => {
    const user = database.users[userId]

    if (!user) {
      return {
        content: [
          {
            type: 'text',
            text: `用户 ID ${userId} 不存在。可用的 ID: 001, 002, 003`,
          },
        ],
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `用户信息：\n- ID: ${user.id}\n- 姓名: ${user.name}\n- 邮箱: ${user.email}\n- 角色: ${user.role}`,
        },
      ],
    }
  },
)

// 注册工具：查询全部用户列表
server.registerTool(
  'list_users',
  {
    description:
      '列出数据库中所有用户。无需输入参数，返回每个用户的 ID、姓名、邮箱和角色。',
    inputSchema: {},
  },
  async () => {
    const users = Object.values(database.users)

    return {
      content: [
        {
          type: 'text',
          text: `共 ${users.length} 位用户：\n${users
            .map(
              user =>
                `- ID: ${user.id} | 姓名: ${user.name} | 邮箱: ${user.email} | 角色: ${user.role}`,
            )
            .join('\n')}`,
        },
      ],
    }
  },
)

// Resource 类型 1：静态纯文本资源
server.registerResource(
  '使用指南',
  'docs://guide',
  {
    description: 'MCP Server 使用文档',
    mimeType: 'text/plain',
  },
  async () => {
    return {
      contents: [
        {
          uri: 'docs://guide',
          mimeType: 'text/plain',
          text: `MCP Server 使用指南

功能：提供用户查询等工具。

使用：在 Cursor 等 MCP Client 中通过自然语言对话，Cursor 会自动调用相应工具。`,
        },
      ],
    }
  },
)

// Resource 类型 2：JSON 资源。mimeType 声明为 application/json，Client 可直接解析
server.registerResource(
  '用户列表数据',
  'data://users',
  {
    description:
      '全部用户的结构化数据（JSON），与 list_users 工具返回同样的数据',
    mimeType: 'application/json',
  },
  async uri => {
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(Object.values(database.users), null, 2),
        },
      ],
    }
  },
)

// Resource 类型 3：URI 模板资源。走 resources/templates/list，由 URI 变量做参数化
server.registerResource(
  '单个用户数据',
  new ResourceTemplate('data://users/{userId}', {
    // list：把模板展开成具体 URI，Client 的 resources/list 才能看到它们
    list: async () => {
      return {
        resources: Object.values(database.users).map(user => ({
          uri: `data://users/${user.id}`,
          name: `用户 ${user.name}`,
          mimeType: 'application/json',
        })),
      }
    },
    // complete：URI 变量的自动补全，Client 输入 0 时提示 001/002/003
    complete: {
      userId: async value => {
        return Object.keys(database.users).filter(id => id.startsWith(value))
      },
    },
  }),
  {
    description: '按 ID 读取单个用户数据，URI 形如 data://users/001',
    mimeType: 'application/json',
  },
  async (uri, { userId }) => {
    const user = database.users[userId]

    // Resource 没有 isError 字段，读不到就抛错，由协议层转成 JSON-RPC error
    if (!user) {
      throw new Error(`资源不存在：${uri.href}`)
    }

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(user, null, 2),
        },
      ],
    }
  },
)

// Resource 类型 4：二进制资源。用 blob（base64）字段而不是 text
const avatarPlaceholderBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

server.registerResource(
  '头像占位图',
  'assets://avatar-placeholder.png',
  {
    description: '二进制资源示例：1x1 PNG，以 base64 放在 blob 字段返回',
    mimeType: 'image/png',
  },
  async uri => {
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'image/png',
          blob: avatarPlaceholderBase64,
        },
      ],
    }
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)
