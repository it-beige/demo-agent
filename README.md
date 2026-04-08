# demo-agent

一个面向学习的示例仓库，用来理解两类常见 AI 应用形态：

1. `Agent`：让模型结合本地工具完成一个实际任务
2. `MCP Server`：把本地能力封装成标准化工具，供 Cursor 等 MCP Client 调用

这个仓库不是生产级框架，更像一个方便拆开阅读、动手实验、逐步扩展的最小示例集合。

## 📚 学习目录

本仓库按章节逐步添加学习内容，每个章节聚焦一个主题：

### 第 1 章：Agent 基础示例

- **文件**：`src/index.mjs`, `src/tool-runner.mjs`, `src/tools/*`
- **内容**：模型调用本地工具（读/写文件、执行命令）完成任务
- **产物**：自动生成 React Todo 应用

### 第 2 章：MCP Server 基础

- **文件**：`src/mcp-server.mjs`
- **内容**：Tool、Resource 定义，stdio 通信，zod 参数校验
- **重点**：理解 MCP 协议的基本组成

### 第 3 章：多 MCP Server 集成

- **文件**：`src/mcp-amap.mjs`
- **内容**：MultiServerMCPClient、高德地图 MCP、filesystem MCP
- **流程图**：`src/mco-amap-flow.md`

### 第 4 章：RAG 检索增强生成

- **文件**：`src/loader-and-spliter2.mjs`, `src/rag-demo.mjs`
- **内容**：网页加载 → 文本切分 → 向量索引 → 检索回答
- **重点**：chunkSize/chunkOverlap、embeddings 降级兜底

### 第 5 章：动态网站内容提取

- **文件**：`src/loader-and-spliter.mjs`
- **内容**：Puppeteer 抓取掘金文章、Document 转换、文本分割
- **重点**：处理 JavaScript 动态渲染的内容

### 第 6 章：兼容性加载方案

- **文件**：`src/loader-and-spliter2.mjs`
- **内容**：Cheerio + Puppeteer 渐进式降级策略
- **重点**：性能与稳定性的平衡设计

### 第 7 章：文本分割器详解

- **文件**：`src/splitters/` 目录下的示例代码
- **内容**：CharacterTextSplitter、RecursiveCharacterTextSplitter、TokenTextSplitter 以及面向特定格式的代码/Markdown/LaTeX 分割器
- **重点**：不同分割策略的适用场景、chunkSize/chunkOverlap 调优、Token 计数控制
- **补充**：语言特定的分割器配置（fromLanguage）

### 第 8 章：对话记忆管理

- **文件**：`src/memory/` 目录下的示例代码
- **内容**：三大记忆管理策略（截断、总结、检索）
  - **基础存储**：InMemoryChatMessageHistory、FileSystemChatMessageHistory
  - **截断策略**：按消息数量截断、按 token 数量截断（trimMessages API）
  - **总结策略**：基于消息数量的总结、基于 token 数量的精确总结
  - **检索策略**：Milvus 向量数据库存储、语义检索、RAG 完整流程
- **重点**：记忆存储策略对比、token 级别的消息管理、向量检索实现、RAG 数据流
- **核心问题**：如何在对话历史过长时智能管理记忆，避免超出模型上下文窗口

---

## 🎯 这个仓库适合学什么

你可以用它快速理解下面几件事：

- 如何通过 `LangChain + OpenAI 兼容接口` 调用模型
- 如何给模型挂载本地工具，让模型自己读文件、写文件、执行命令
- 工具调用循环是怎么工作的
- MCP Server 的基础写法是什么样
- 如何把多个 MCP Server 挂到同一个 Agent 上
- filesystem MCP 的允许目录该怎么配置
- RAG 里"加载 -> 切分 -> 向量检索 -> 回答"的链路怎么串起来
- 当 embeddings 不可用时，怎么给示例代码做降级兜底
- 如何使用 Puppeteer 抓取动态渲染网站的内容
- 如何实现 Cheerio + Puppeteer 的兼容性降级方案
- 如何用 RecursiveCharacterTextSplitter 分割长文档为适合检索的片段
- 如何使用 InMemoryChatMessageHistory 管理内存中的对话历史
- 如何使用 FileSystemChatMessageHistory 持久化对话到本地文件
- 如何通过 trimMessages API 按消息数或 token 数截断历史
- 如何基于消息数量触发对话总结策略
- 如何基于 token 数量实现更精确的对话总结与保留策略
- 如何使用 Milvus 向量数据库存储对话数据
- 如何通过语义相似度检索相关历史对话
- 如何构建 RAG（检索增强生成）完整流程
- 如何实现对话记忆的检索-增强-生成-入库闭环
- Agent 和 MCP 这两种集成方式分别适合什么场景

## 📁 仓库里有什么

详细说明请参考上方的 **📚 学习目录**，这里列出关键文件：

### Agent 示例

- `src/index.mjs`：模型与系统提示词初始化
- `src/tool-runner.mjs`：工具调用循环处理
- `src/tools/*`：本地工具实现（读/写文件、列目录、执行命令）
- `src/agent-react-todo.mjs`：示例任务描述

### MCP Server 示例

- `src/mcp-server.mjs`：MCP Server 基础示例（query_user 工具 + docs://guide 资源）

### MCP Client 示例

- `src/mcp-amap.mjs`：MultiServerMCPClient 集成高德地图和 filesystem

### RAG 示例

- `src/loader-and-spliter2.mjs`：网页加载 + 文本切分 + RAG 完整流程
- `src/rag-demo.mjs`：Embedding 配置与健康检查

### 动态内容提取

- `src/loader-and-spliter.mjs`：Puppeteer 抓取掘金文章

### 文本分割器示例

- `src/splitters/CharacterTextSplitter-test.mjs`：基于字符的分割器示例
- `src/splitters/RecursiveCharacterTextSplitter-test.mjs`：递归字符分割器（支持自定义分隔符）
- `src/splitters/TokenTextSplitter-test.mjs`：基于 Token 计数的分割器
- `src/splitters/recursive-splitter-code.mjs`：代码专用分割器（支持 JS 等语言）
- `src/splitters/recursive-splitter-markdown.mjs`：Markdown 文档专用分割器
- `src/splitters/recursive-splitter-latex.mjs`：LaTeX 数学公式专用分割器

### 对话记忆管理示例

**基础存储**

- `src/memory/history-test.mjs`：InMemoryChatMessageHistory 基础用法（内存存储）
- `src/memory/history-test2.mjs`：FileSystemChatMessageHistory 持久化存储（写入文件）
- `src/memory/history-test3.mjs`：从文件恢复历史对话（读取已保存的会话）
- `src/memory/chat_history.json`：FileSystemChatMessageHistory 的存储文件示例

**截断策略**

- `src/memory/truncation-memory.mjs`：消息截断策略（按消息数、按 token 数）

**总结策略**

- `src/memory/summarization-memory.mjs`：基于消息数量的对话总结策略
- `src/memory/summarization-memory2.mjs`：基于 token 数量的对话总结策略（更精确）

**检索策略（RAG）**

- `src/memory/constant.mjs`：集合名称常量定义
- `src/memory/insert-conversations.mjs`：批量插入对话数据到 Milvus 向量数据库
- `src/memory/retrieval-memory.mjs`：完整的 RAG 检索增强生成流程演示
- `src/memory/query-conversations.mjs`：查询 Milvus 中的所有对话记录

### 流程图

- `src/mco-amap-flow.md`：MCP Agent 调用流程图和时序图

## 项目结构

```text
.
├── agent-react-todo.mjs        # Agent 示例启动入口
├── src/
│   ├── agent-react-todo.mjs    # Agent 示例任务
│   ├── index.mjs               # 模型与系统提示词初始化
│   ├── loader-and-spliter.mjs  # Puppeteer 抓取掘金文章
│   ├── loader-and-spliter2.mjs # RAG + 兼容性加载方案
│   ├── mcp-amap.mjs            # 地图 + filesystem MCP Client 示例
│   ├── mcp-server.mjs          # MCP Server 示例
│   ├── mco-amap-flow.md        # MCP Agent 调用流程图
│   ├── rag-demo.mjs            # RAG 配置与健康检查示例
│   ├── memory/                 # 对话记忆管理示例目录
│   │   ├── history-test.mjs               # InMemoryChatMessageHistory 基础用法
│   │   ├── history-test2.mjs              # FileSystemChatMessageHistory 持久化存储
│   │   ├── history-test3.mjs              # 从文件恢复历史对话
│   │   ├── truncation-memory.mjs          # 消息截断策略（按消息数/token数）
│   │   ├── summarization-memory.mjs       # 基于消息数量的对话总结
│   │   ├── summarization-memory2.mjs      # 基于 token 数量的对话总结
│   │   ├── constant.mjs                   # 集合名称常量定义
│   │   ├── insert-conversations.mjs       # 批量插入对话到 Milvus
│   │   ├── retrieval-memory.mjs           # RAG 检索增强生成流程
│   │   ├── query-conversations.mjs        # 查询 Milvus 中的所有记录
│   │   └── chat_history.json              # 文件存储示例
│   ├── splitters/              # 文本分割器示例目录
│   │   ├── CharacterTextSplitter-test.mjs           # 基于字符的分割
│   │   ├── RecursiveCharacterTextSplitter-test.mjs  # 递归字符分割（自定义分隔符）
│   │   ├── TokenTextSplitter-test.mjs               # 基于 Token 计数的分割
│   │   ├── recursive-splitter-code.mjs              # 代码专用分割器
│   │   ├── recursive-splitter-markdown.mjs          # Markdown 文档分割
│   │   └── recursive-splitter-latex.mjs             # LaTeX 公式分割
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

如果你要运行高德地图 MCP 示例，还需要：

```bash
AMAP_MAPS_API_KEY=your-amap-key
ALLOWED_PATHS=/absolute/path/one,/absolute/path/two
```

说明：

- `AMAP_MAPS_API_KEY`：高德地图 MCP 服务使用的 Key
- `ALLOWED_PATHS`：filesystem MCP 可访问的绝对路径列表，多个路径用英文逗号分隔

如果你要运行向量检索示例，还可以额外提供：

```bash
EMBEDDINGS_BASE_URL=https://your-embeddings-endpoint
EMBEDDINGS_API_KEY=your-embeddings-key
EMBEDDINGS_MODEL=text-embedding-3-small
```

如果不提供 `EMBEDDINGS_*`，当前示例会优先回退到 `API_KEY / BASE_URL`，再不行就自动降级为关键词检索。

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

如果你直接运行：

```bash
node src/mcp-server.mjs
```

进程通常会保持等待状态，这是正常的，因为它在等待 MCP Client 通过标准输入输出与它通信。

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
- `查询用户 999 的信息`

当前示例内置的可查询用户 ID 为：`001`、`002`、`003`。

你也可以把这部分当成一个小练习：

1. 先查询一个存在的用户，观察工具返回内容
2. 再查询一个不存在的用户，观察错误提示怎么返回
3. 再读取 `docs://guide`，感受 Resource 和 Tool 的区别

### 运行地图 + filesystem MCP Agent 示例

执行：

```bash
node src/mcp-amap.mjs "请列出 /Users/chenkun/Desktop 下的前几个文件，如果工具结果不足以支持结论，请明确说明不确定。"
```

或者：

```bash
node src/mcp-amap.mjs "查一下北京南站三公里附近的酒店，如果工具结果不足以支持结论，请明确说明不确定。"
```

这个示例适合重点观察：

- 模型会不会先选对工具
- filesystem 工具是否只能访问 `ALLOWED_PATHS` 里声明过的目录
- 当工具结果不足时，模型是否会明确说“不确定”

### 运行 RAG 示例

执行：

```bash
node src/loader-and-spliter2.mjs
```

这个示例会：

- 抓取一篇网页文章
- 切分文本
- 尝试建立向量检索
- embeddings 不可用时自动切换为关键词检索
- 最后基于检索到的片段回答问题

如果你只想测试 embeddings 配置是否可用，也可以看 `src/rag-demo.mjs`。

### 运行对话记忆管理示例

**1. 测试内存存储（InMemoryChatMessageHistory）**

```bash
node src/memory/history-test.mjs
```

这个示例会：

- 在内存中创建对话历史
- 演示两轮对话的完整流程
- 展示所有历史消息的保存情况
- 适合理解 LangChain 消息管理的基础概念

**2. 测试文件持久化（FileSystemChatMessageHistory）**

```bash
node src/memory/history-test2.mjs
```

这个示例会：

- 将对话历史保存到 `src/memory/chat_history.json`
- 演示多轮对话的持久化存储
- 可以在运行后查看 JSON 文件了解存储格式

**3. 测试历史恢复**

```bash
node src/memory/history-test3.mjs
```

这个示例会：

- 从 `chat_history.json` 文件加载之前的对话
- 展示恢复后的历史消息
- 继续在恢复的对话基础上进行新对话

**4. 测试消息截断策略**

```bash
node src/memory/truncation-memory.mjs
```

这个示例会：

- 演示按消息数量截断（保留最近 N 条消息）
- 演示按 token 数量截断（使用 `trimMessages` API）
- 使用 `js-tiktoken` 精确计算 token 数

**5. 测试基于消息数量的总结**

```bash
node src/memory/summarization-memory.mjs
```

这个示例会：

- 当消息数量超过阈值时触发总结
- 保留最近的 2 条消息
- 调用 AI 模型总结旧对话的核心内容

**6. 测试基于 token 数量的总结（更精确）**

```bash
node src/memory/summarization-memory2.mjs
```

这个示例会：

- 使用 `cl100k_base` 编码器计算 token 数
- 当总 token 数超过 200 时触发总结
- 保留最近约 80 个 token 的消息（约占 40%）
- 逆向遍历算法：从最新消息开始保留，确保上下文连贯

**7. 测试检索策略 - 数据准备（Milvus 向量数据库）**

⚠️ **前置条件**：需要先启动 Milvus 服务

```bash
node src/memory/insert-conversations.mjs
```

这个示例会：

- 连接到本地 Milvus 向量数据库（localhost:19530）
- 创建 `conversations` 集合（包含 id、vector、content、round、timestamp 字段）
- 创建 IVF_FLAT 索引，使用 COSINE 相似度度量
- 批量插入 5 条测试对话数据
- 使用 Embeddings 模型将对话文本转换为 1024 维向量

**8. 测试检索策略 - RAG 完整流程**

```bash
node src/memory/retrieval-memory.mjs
```

这个示例会：

- 演示完整的 RAG（检索增强生成）流程
- 针对 3 个测试问题，依次执行：
  1. **检索**：将问题向量化，从 Milvus 检索最相似的 2 条历史对话
  2. **增强**：将检索到的历史对话作为上下文构建 prompt
  3. **生成**：调用 AI 模型生成回答
  4. **入库**：将新对话向量化后存入 Milvus，形成闭环
- 显示每条检索结果的相似度分数（score）

**9. 测试检索策略 - 查询所有记录**

```bash
node src/memory/query-conversations.mjs
```

这个示例会：

- 查询 Milvus 集合中的所有对话记录
- 显示每条记录的完整信息（ID、轮次、时间、内容）
- 适合验证数据插入和检索结果

## Agent 内置工具说明

当前 Agent 示例挂载了 4 个本地工具：

- `file-read`：读取文件内容
- `file-write`：写入文件，自动创建目录
- `directory-list`：列出目录内容
- `command-execute`：执行系统命令，可指定 `workingDirectory`

其中 `command-execute` 的设计重点是：目录切换通过 `workingDirectory` 控制，而不是在命令字符串里手动写 `cd xxx && ...`。

这也是一个很适合学习的点：提示词设计会直接影响 Agent 是否能稳定调用工具。

## Agent 和 MCP 怎么区分

可以先用一个很粗的理解方式：

- `Agent`：你在应用内部主动把工具交给模型，模型在一次任务流程里自主决策怎么调用
- `MCP`：你把能力做成标准服务，由外部 MCP Client 接入、发现和调度

这个仓库把两种方式都放在一起，正好适合对比学习：

- 如果你想理解“模型如何在多轮中调用本地工具”，先看 Agent
- 如果你想理解“能力如何以协议形式提供给外部客户端”，先看 MCP Server

两条路线都在做“给模型能力”，但抽象层级和接入位置不一样。

再往前走一步可以这样理解：

- `MCP Server`：暴露能力
- `MCP Client`：发现并连接这些能力
- `Agent`：拿到这些能力后，决定什么时候用、怎么组合使用

`src/mcp-amap.mjs` 就是一个很直接的例子：它自己不是工具提供方，而是“工具使用方”。

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

**对话记忆管理学习路径**：

如果是第一次学习记忆管理，建议按这个顺序：

**基础存储（3 个文件）**

1. **内存存储**：`src/memory/history-test.mjs` - 理解 InMemoryChatMessageHistory
2. **文件持久化**：`src/memory/history-test2.mjs` - 学习 FileSystemChatMessageHistory
3. **历史恢复**：`src/memory/history-test3.mjs` - 理解会话恢复机制

**截断策略（1 个文件）** 4. **消息截断**：`src/memory/truncation-memory.mjs` - 掌握按消息数/token 数截断

**总结策略（2 个文件）** 5. **消息数总结**：`src/memory/summarization-memory.mjs` - 学习基于消息数量的总结 6. **Token 级总结**：`src/memory/summarization-memory2.mjs` - 理解更精确的 token 级别管理

**检索策略 - RAG（4 个文件，需先启动 Milvus）** 7. **常量定义**：`src/memory/constant.mjs` - 了解集合名称配置 8. **数据插入**：`src/memory/insert-conversations.mjs` - 批量导入对话到向量数据库 9. **RAG 流程**：`src/memory/retrieval-memory.mjs` - 完整的检索-增强-生成-入库闭环10. **数据查询**：`src/memory/query-conversations.mjs` - 查看向量数据库中的所有记录

## 建议动手练习

如果你想把这次新增内容真正学进去，可以直接做下面这些小练习：

### MCP 相关练习

1. 在 `src/mcp-server.mjs` 里新增一个 `list_users` 工具，返回所有用户 ID 和姓名
2. 给 `query_user` 增加更多字段，比如部门、手机号或创建时间
3. 新增一个资源，比如 `docs://users`，专门说明当前有哪些用户数据
4. 把内存数据库拆到单独文件里，感受代码组织方式的变化
5. 对照 `src/tool-runner.mjs`，思考 Agent 的工具调用循环和 MCP 的调用方式有什么本质差异

### 对话记忆管理练习

**基础存储与截断**

1. 修改 `summarization-memory2.mjs`，将生成的摘要也添加回历史记录（目前只计算但未保存）
2. 实现分级总结策略：旧消息总结多次，每次越来越精简
3. 给 `truncation-memory.mjs` 增加系统提示词保留功能（SystemMessage 始终不被截断）
4. 实现一个混合策略：优先按 token 数，但最少保留 N 条消息
5. 尝试使用 `ConversationSummaryMemory`（LangChain 内置）对比自定义实现
6. 给 FileSystemChatMessageHistory 增加多会话管理（不同 sessionId 的切换）

**检索策略 - RAG** 7. 修改 `insert-conversations.mjs`，批量插入 100 条对话数据，观察性能变化 8. 调整 `retrieval-memory.mjs` 中的 k 值（检索数量），对比 k=1、k=3、k=5 的回答质量 9. 给检索增加过滤条件，如只检索最近 3 轮的对话（`filter: 'round >= 3'`）10. 实现动态 k 值：根据问题类型自动调整检索数量 11. 添加检索结果的缓存层（Redis），避免重复查询相同问题 12. 对比不同相似度度量方式（COSINE vs L2 vs IP）的检索效果差异

这几个练习都不大，但非常适合建立对 MCP 和 Agent 的直觉。

## MCP 配置踩坑记录

这部分是这次学习里非常容易踩到的几个真实问题。

### 1. filesystem MCP 的路径参数不能拼成一个字符串

错误写法思路：

```js
process.env.ALLOWED_PATHS.split(',').join(' ')
```

这会把多个目录拼成一个参数字符串，结果 `server-filesystem` 接收到的不是多个独立路径。

正确思路是把它展开成多个参数：

```js
const allowedPaths = process.env.ALLOWED_PATHS.split(',')
  .map(v => v.trim())
  .filter(Boolean)
args: ['-y', '@modelcontextprotocol/server-filesystem', ...allowedPaths]
```

如果写在 `mcp.json` 里，就直接把多个路径静态展开写进去。

### 2. filesystem 必须放在 `mcpServers` 里

`MultiServerMCPClient` 只会读取 `mcpServers` 下声明的服务。如果把 `filesystem` 写到 `mcpServers` 外层，客户端不会加载它。

### 3. `chrome-devtools-mcp` 对 Node 版本有要求

这次实际遇到的问题是：

- 当前 Node：`v20.11.1`
- `chrome-devtools-mcp@0.21.0` 要求：`^20.19.0 || ^22.12.0 || >=23`

如果 MCP Client 启动它时报 `EBADENGINE` 或 `Client closed`，优先检查 Node 版本。

对 GUI 客户端，最稳的方式不是依赖 `nvm use`，而是在配置里直接写新版 `npx` 的绝对路径，例如：

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "/Users/chenkun/.nvm/versions/node/v22.22.1/bin/npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

## 可以继续扩展的方向

**通用扩展**

- 给根项目补充 `npm scripts`，减少手动输入命令
- 为工具增加更严格的参数校验和错误处理
- 增加文件搜索、HTTP 请求、Git 操作等更多工具
- 把 Agent 示例改造成命令行可输入任意任务
- 把 MCP Server 里的内存数据换成真实数据库或外部接口
- 增加日志记录，方便观察每轮模型决策和工具调用

**对话记忆管理扩展**

- 为对话记忆管理增加数据库后端（如 Redis、MongoDB）
- 实现更智能的记忆压缩策略（关键信息提取、实体保留）
- 增加记忆管理的可视化调试工具
- 实现记忆的自动过期清理机制（TTL）
- 支持多用户会话隔离与权限控制
- 增加检索结果的反馈学习（记录哪些检索结果被有效使用）

## 注意事项

- 这是一个学习仓库，重点是帮助理解思路，不是生产环境最佳实践
- `command-execute` 直接执行 shell 命令，真实场景需要更严格的权限和安全限制
- 当前根项目没有自动化测试
- 如果你准备继续扩展，建议优先补上脚本、日志和错误处理
- 运行检索策略示例前，需要先启动 Milvus 服务（参考 Docker Compose 配置）
- Milvus 向量数据库占用内存较大，建议至少分配 4GB 以上内存
