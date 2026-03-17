# demo-agent

一个基于 `LangChain + OpenAI 兼容模型 + 本地工具调用` 的示例项目。它会把用户任务交给大模型，由模型自主选择工具，在当前工作目录中读取文件、写入文件、列出目录、执行命令，并完成一个真实的小型开发任务。

当前仓库内已经包含一个由 Agent 生成的示例前端项目：[react-todo-app](/Users/chenkun/Personal/ai/01/demo-agent/react-todo-app)。

## 功能概览

- 通过 `ChatOpenAI` 连接 OpenAI 兼容接口
- 通过工具调用读写本地文件
- 支持在指定工作目录执行命令
- 支持目录扫描，帮助模型理解项目结构
- 内置一个示例任务：自动生成并运行 React Todo 应用

## 项目结构

```text
.
├── agent-react-todo.mjs        # 示例启动入口
├── src/
│   ├── agent-react-todo.mjs    # 示例任务内容
│   ├── index.mjs               # Agent 初始化与运行入口
│   ├── tool-runner.mjs         # 工具调用循环
│   └── tools/                  # 本地工具实现
└── react-todo-app/             # Agent 生成的 React Todo 示例项目
```

## 内置工具

- `file-read`：读取文件内容
- `file-write`：写入文件，自动创建目录
- `directory-list`：列出目录内容
- `command-execute`：执行系统命令，可指定 `workingDirectory`

`command-execute` 的设计重点是“目录切换由参数控制”，因此在 Agent 提示词里明确要求：

- 需要切换目录时，使用 `workingDirectory`
- 不要在命令字符串里手动写 `cd xxx && ...`

## 环境要求

- Node.js 18+
- pnpm
- 可用的 OpenAI 兼容模型服务

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

根目录 `.env` 需要提供以下变量：

```bash
MODEL=your-model-name
API_KEY=your-api-key
BASE_URL=https://your-openai-compatible-endpoint
```

说明：

- `MODEL`：要调用的模型名
- `API_KEY`：服务密钥
- `BASE_URL`：兼容 OpenAI API 的服务地址

## 运行方式

执行示例任务：

```bash
node agent-react-todo.mjs
```

这个入口会加载 [src/agent-react-todo.mjs](/Users/chenkun/Personal/ai/01/demo-agent/src/agent-react-todo.mjs)，并向 Agent 下发一段中文任务指令，让它：

- 创建一个 React + TypeScript + Vite 项目
- 实现 TodoList 的增删改查、筛选和统计
- 添加样式与动画
- 安装依赖并启动开发服务器

## React Todo 示例

[react-todo-app](/Users/chenkun/Personal/ai/01/demo-agent/react-todo-app) 是当前仓库中已经存在的示例产物，核心能力包括：

- 添加、删除、编辑待办事项
- 完成状态切换
- 按全部 / 进行中 / 已完成筛选
- 任务统计
- 基于 `localStorage` 的本地持久化
- 带渐变背景、卡片阴影和过渡动画的界面

前端项目单独运行方式：

```bash
cd react-todo-app
pnpm install
pnpm dev
```

## 核心实现说明

- [src/index.mjs](/Users/chenkun/Personal/ai/01/demo-agent/src/index.mjs)：创建模型实例，注入系统提示词和工具集
- [src/tool-runner.mjs](/Users/chenkun/Personal/ai/01/demo-agent/src/tool-runner.mjs)：循环处理模型返回的 `tool_calls`
- [src/tools/command-execute.mjs](/Users/chenkun/Personal/ai/01/demo-agent/src/tools/command-execute.mjs)：封装命令执行能力
- [src/tools/file-read.mjs](/Users/chenkun/Personal/ai/01/demo-agent/src/tools/file-read.mjs)：读取文件
- [src/tools/file-write.mjs](/Users/chenkun/Personal/ai/01/demo-agent/src/tools/file-write.mjs)：写入文件
- [src/tools/directory-list.mjs](/Users/chenkun/Personal/ai/01/demo-agent/src/tools/directory-list.mjs)：列出目录

## 适合继续扩展的方向

- 增加 `npm script`，简化启动命令
- 为工具增加参数校验和更丰富的错误处理
- 记录每轮工具调用日志到文件
- 增加更多本地工具，例如文件搜索、Git 操作、HTTP 请求
- 把示例任务改造成可从命令行动态输入

## 注意事项

- `command-execute` 使用 shell 执行命令，适合做演示，但在生产场景需要更严格的安全约束
- 当前根项目还没有配置自动化测试
- `react-todo-app` 下自带一个 Vite 默认 README，根目录这个 README 更适合作为仓库总览
