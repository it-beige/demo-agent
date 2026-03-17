# demo-agent

一个面向学习的示例仓库，用来理解两类常见 AI 应用形态：

1. `Agent`：让模型结合本地工具完成一个实际任务
2. `MCP Server`：把本地能力封装成标准化工具，供 Cursor 等 MCP Client 调用

这个仓库不是生产级框架，更像一个方便拆开阅读、动手实验、逐步扩展的最小示例集合。

## 这个仓库适合学什么

你可以用它快速理解下面几件事：

- 如何通过 `LangChain + OpenAI 兼容接口` 调用模型
- 如何给模型挂载本地工具，让模型自己读文件、写文件、执行命令
- 工具调用循环是怎么工作的
- MCP Server 的基础写法是什么样
- Agent 和 MCP 这两种集成方式分别适合什么场景

## 仓库里有什么

### 1. Agent 示例

Agent 部分会把一个真实任务交给模型，让模型自己决定何时调用工具。当前内置的示例任务是：自动创建并完善一个 React Todo 应用。

相关文件：

- `src/index.mjs`：创建模型实例，注入系统提示词和工具集
- `src/tool-runner.mjs`：处理模型返回的 `tool_calls`，并把工具结果继续喂回模型
- `src/tools/*`：本地工具实现，包括读文件、写文件、列目录、执行命令
- `src/agent-react-todo.mjs`：示例任务内容
- `agent-react-todo.mjs`：根目录启动入口

仓库中的 `react-todo-app/` 是一次示例运行后生成的结果，方便直接查看 Agent 最终产物。

### 2. MCP Server 示例

`src/mcp-server.mjs` 提供了一个非常轻量的 MCP Server，用来演示 MCP 的基本组成：

- 一个工具 `query_user`
- 一个资源 `docs://guide`
- 基于 `stdio` 的服务启动方式

这个示例里内置了一份简单“数据库”，可以根据用户 ID 查询用户信息，适合拿来理解：

- `registerTool(...)` 怎么定义输入参数和描述
- `registerResource(...)` 怎么暴露资源
- MCP Client 是如何通过标准协议发现并调用这些能力的

## 项目结构

```text
.
├── agent-react-todo.mjs        # Agent 示例启动入口
├── src/
│   ├── agent-react-todo.mjs    # Agent 示例任务
│   ├── index.mjs               # 模型与系统提示词初始化
│   ├── mcp-server.mjs          # MCP Server 示例
│   ├── tool-runner.mjs         # 工具调用循环
│   └── tools/                  # 本地工具实现
└── react-todo-app/             # Agent 生成的 React Todo 示例项目
```

## 环境要求

- Node.js 18+
- pnpm
- 一个可用的 OpenAI 兼容模型服务

## 安装依赖

在仓库根目录执行：

```bash
pnpm install
```

如果你也想单独运行前端示例，再进入子项目安装一次：

```bash
cd react-todo-app
pnpm install
```

## 环境变量

根目录 `.env` 需要提供：

```bash
MODEL=your-model-name
API_KEY=your-api-key
BASE_URL=https://your-openai-compatible-endpoint
```

说明：

- `MODEL`：模型名称
- `API_KEY`：接口密钥
- `BASE_URL`：OpenAI 兼容接口地址

## 如何运行

### 运行 Agent 示例

执行：

```bash
node agent-react-todo.mjs
```

它会调用 `src/agent-react-todo.mjs` 中的中文任务描述，让模型尝试完成下面这些事：

- 创建一个 React + TypeScript + Vite 项目
- 实现 TodoList 的增删改查、筛选和统计
- 添加样式与动画
- 安装依赖并启动开发服务器

### 使用 MCP Server 示例

这个 Server 采用 `stdio` 通信，通常不是你在终端里手动交互，而是由 MCP Client 启动，例如 Cursor、Claude Desktop 或其他支持 MCP 的工具。

如果某个客户端支持通过命令注册 MCP Server，通常可以配置成下面这样：

```json
{
  "mcpServers": {
    "demo-agent": {
      "command": "node",
      "args": ["/path/to/demo-agent/src/mcp-server.mjs"]
    }
  }
}
```

启动后，你可以让客户端尝试类似请求：

- `查询用户 001 的信息`
- `读取 docs://guide 这个资源`

当前示例内置的可查询用户 ID 为：`001`、`002`、`003`。

## Agent 内置工具说明

当前 Agent 示例挂载了 4 个本地工具：

- `file-read`：读取文件内容
- `file-write`：写入文件，自动创建目录
- `directory-list`：列出目录内容
- `command-execute`：执行系统命令，可指定 `workingDirectory`

其中 `command-execute` 的设计重点是：目录切换通过 `workingDirectory` 控制，而不是在命令字符串里手动写 `cd xxx && ...`。

这也是一个很适合学习的点：提示词设计会直接影响 Agent 是否能稳定调用工具。

## react-todo-app 说明

`react-todo-app/` 是当前仓库自带的示例产物，方便你直接查看 Agent 最终生成了什么。它当前包含：

- 添加、删除、编辑待办事项
- 完成状态切换
- 按全部 / 进行中 / 已完成筛选
- 任务统计
- 基于 `localStorage` 的本地持久化
- 基础界面样式和过渡动画

如果你想单独启动它：

```bash
cd react-todo-app
pnpm install
pnpm dev
```

`react-todo-app/README.md` 仍然是 Vite 默认内容，阅读这个仓库时优先看根目录 `README.md` 即可。

## 推荐学习顺序

如果你是第一次接触这类项目，建议按这个顺序看：

1. 先看 `src/mcp-server.mjs`，理解 MCP Server 最小结构
2. 再看 `src/tools/`，理解本地工具是怎么封装的
3. 然后看 `src/tool-runner.mjs`，理解工具调用循环
4. 最后看 `src/index.mjs` 和 `src/agent-react-todo.mjs`，理解 Agent 如何接任务并驱动整个流程

## 可以继续扩展的方向

- 给根项目补充 `npm scripts`，减少手动输入命令
- 为工具增加更严格的参数校验和错误处理
- 增加文件搜索、HTTP 请求、Git 操作等更多工具
- 把 Agent 示例改造成命令行可输入任意任务
- 把 MCP Server 里的内存数据换成真实数据库或外部接口
- 增加日志记录，方便观察每轮模型决策和工具调用

## 注意事项

- 这是一个学习仓库，重点是帮助理解思路，不是生产环境最佳实践
- `command-execute` 直接执行 shell 命令，真实场景需要更严格的权限和安全限制
- 当前根项目没有自动化测试
- 如果你准备继续扩展，建议优先补上脚本、日志和错误处理
