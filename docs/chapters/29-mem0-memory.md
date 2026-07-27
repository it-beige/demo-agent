# [Memory·Mem0] Mem0 记忆方案：从云端 API 到双层记忆架构

> Mem0 是专为 AI Agent 设计的长期语义记忆层，能从w对话中自动提取事实、向量化存储、语义检索。本章用五个模块演示从 Mem0 Cloud API 基础操作到 Redis + Mem0 双层记忆架构的完整方案：基础 CRUD、三种 Scope 隔离、混合搜索调优、自建 REST API、LLM 驱动的记忆分层分类。
> **关键词**：mem0ai、Qdrant、语义记忆、记忆分层、rerank、MemoryClient、FastAPI

## 为什么需要 Mem0

[第 28 章](./28-redis-agent-memory.md)用 Redis 解决了 Agent 短期记忆（会话内消息存储），但 Redis 存的是**原始消息序列**，有三个局限：

| 局限     | Redis 短期记忆      | Mem0 长期记忆                |
| -------- | ------------------- | ---------------------------- |
| 信息密度 | 存全部消息，冗余多  | 自动提取关键事实，一句话一条 |
| 检索方式 | 按 Key 读取，无语义 | 向量语义搜索，模糊匹配       |
| 跨会话   | 需手动管理 Key      | user_id 天然隔离，自动持久   |

Mem0 的核心能力：

1. **自动事实提取**：调用 LLM 从对话中抽取「值得记住的事实」（如"对花生过敏""住在杭州"），而非存储原始消息
2. **语义搜索**：将事实向量化存入 Qdrant，支持自然语言查询（"用户有什么饮食限制"→命中"对坚果过敏"）
3. **三种 Scope**：`user_id`（跨会话长期）、`run_id`（单次会话）、`agent_id`（Agent 级别），通过过滤器灵活组合
4. **云端 / 自建双模式**：Cloud API 开箱即用；自建模式用 Qdrant + 任意 OpenAI 兼容 LLM/Embedder，数据完全私有

## 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                     mem0-test 五大模块                       │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  模块一       │  模块二       │  模块三       │  模块四         │
│  Cloud API   │  Scoped      │  Hybrid      │  Local API     │
│  基础 CRUD    │  三种 Scope   │  混合搜索     │  自建 REST     │
│  (mem0ai)    │  (mem0ai)    │  (mem0ai)    │  (server.py)   │
├──────────────┴──────────────┴──────────────┼────────────────┤
│              模块五：Redis + Mem0 双层记忆架构               │
│  Redis = 短期消息存储  │  Mem0 = 长期事实记忆  │  LLM 分类器    │
│  (mem0-redis-mem0-agent.mjs)                               │
└─────────────────────────────────────────────────────────────┘
```

## 代码结构

```
src/mem0-test/
├── docker-compose.yml              # Redis 7 + RedisInsight（模块五依赖）
├── server.py                       # 自建 Mem0 REST API（模块四）
├── package.json                    # npm scripts（add/search/list/agent 等）
├── volumes/
│   └── redis/                      # Redis AOF 持久化数据
└── src/
    ├── mem0-test.mjs               # 模块一：Cloud API 基础 CRUD
    ├── mem0-scoped-memory-test.mjs # 模块二：三种 Scope 隔离
    ├── mem0-hybrid-search-test.mjs # 模块三：混合搜索调优
    ├── mem0-local-api-demo.mjs     # 模块四：自建 API 客户端
    └── mem0-redis-mem0-agent.mjs   # 模块五：双层记忆 Agent
```

## 技术栈

| 组件       | 技术                          | 作用                       |
| ---------- | ----------------------------- | -------------------------- |
| Cloud SDK  | `mem0ai` (npm)                | Mem0 Cloud API 客户端      |
| 自建 API   | `mem0` (pip) + FastAPI        | Python 自建 Mem0 REST 服务 |
| 向量存储   | Qdrant                        | 自建模式的向量数据库       |
| 短期记忆   | Redis 7 + `ioredis`           | 双层架构中的会话级消息存储 |
| LLM 框架   | LangChain + `langchain` agent | 双层架构中的 Agent 编排    |
| 结构化输出 | Zod                           | LLM 分类器的结构化 schema  |

---

## 模块一：mem0-test — Cloud API 基础 CRUD

最简入门：用 `mem0ai` SDK 连接 Mem0 Cloud，演示记忆的增删改查全流程。

### 核心 API

```js
import { MemoryClient } from 'mem0ai'

const client = new MemoryClient({ apiKey: process.env.MEM0_API_KEY })

// 添加：传入对话消息，Mem0 自动提取事实
await client.add(
  [
    { role: 'user', content: '我是素食主义者，而且对坚果过敏。' },
    { role: 'assistant', content: '好的，我会记住你的饮食偏好。' },
  ],
  { userId: USER_ID },
)

// 搜索：语义查询，返回最相关的记忆
await client.search('用户的饮食限制是什么？', {
  filters: { user_id: USER_ID },
  topK: 5,
})

// 列出：分页获取全部记忆
await client.getAll({ filters: { user_id: USER_ID }, pageSize: 10 })

// 更新 + 历史追溯
await client.update(memoryId, { text: '更新后的内容' })
await client.history(memoryId) // 查看变更记录
```

### 关键设计

| 设计点       | 说明                                                        |
| ------------ | ----------------------------------------------------------- |
| 异步处理     | `add` 提交后异步提取事实，需等待几秒再 `search`             |
| filters 必填 | `search`/`getAll` 必须传 `filters: { user_id }`，否则返回空 |
| userId 隔离  | 不同用户的记忆互不可见                                      |

### 运行

```bash
pnpm start           # add：添加测试记忆
pnpm start:search    # search：语义搜索
pnpm start:list      # list：列出全部记忆
pnpm start:update    # update：更新 + 查看变更历史
pnpm cleanup         # 清理测试数据
```

---

## 模块二：mem0-scoped-memory-test — 三种记忆 Scope

Mem0 支持三种记忆隔离维度，可以单独使用或组合过滤：

```
┌─────────────────────────────────────────────┐
│              Mem0 记忆 Scope                 │
├───────────┬──────────────┬──────────────────┤
│  user_id  │   run_id     │    agent_id      │
│  跨会话    │  单次会话     │   Agent 级别     │
│  长期画像  │  本次任务     │   角色设定       │
└───────────┴──────────────┴──────────────────┘
```

### 三种 Scope 对比

| Scope    | 参数      | 过滤器写法                           | 适用场景                 |
| -------- | --------- | ------------------------------------ | ------------------------ |
| 用户层   | `userId`  | `{ user_id: USER_ID }`               | 姓名、居住地、长期偏好   |
| 会话层   | `runId`   | `{ AND: [{ user_id }, { run_id }] }` | 本次任务大纲、临时决策   |
| Agent 层 | `agentId` | `{ agent_id: AGENT_ID }`             | Agent 角色设定、回答风格 |

### 代码示例

```js
// 用户层：跨会话长期记忆
await client.add(messages, { userId: USER_ID })
await client.search('用户住在哪里', { filters: { user_id: USER_ID } })

// 会话层：仅当前会话有效（需配合 user_id 做 AND 过滤）
await client.add(messages, { userId: USER_ID, runId: RUN_ID })
await client.search('这次对话要先做什么', {
  filters: { AND: [{ user_id: USER_ID }, { run_id: RUN_ID }] },
})

// Agent 层：Agent 级别设定
await client.add(messages, { agentId: AGENT_ID })
await client.search('Agent 的角色和回答方式', {
  filters: { agent_id: AGENT_ID },
})
```

> **注意**：会话层搜索必须用 `AND` 组合 `user_id` + `run_id`，单独传 `run_id` 不会生效。这是 Mem0 v2.0.11+ 的 API 要求。

### 运行

```bash
pnpm scoped-memory           # add：添加三种 Scope 的测试数据
pnpm scoped-memory:search    # search：分别搜索三种 Scope
pnpm scoped-memory:cleanup   # 清理测试数据
```

---

## 模块三：mem0-hybrid-search-test — 混合搜索调优

演示 `rerank`、`threshold`、`topK` 三个参数对搜索结果质量的影响，用同一组查询对比不同策略。

### 三种搜索策略对比

```js
// 1. 基础向量搜索：纯语义相似度
const basic = await client.search(query, {
  filters: { user_id: USER_ID },
  topK: 5,
})

// 2. Rerank 增强：向量召回 + 重排模型精排
const reranked = await client.search(query, {
  filters: { user_id: USER_ID },
  topK: 5,
  rerank: true,
})

// 3. 高 threshold 严格过滤：只保留高相关结果
const strict = await client.search(query, {
  filters: { user_id: USER_ID },
  topK: 5,
  threshold: 0.5,
})
```

### 参数说明

| 参数        | 作用         | 调优建议                               |
| ----------- | ------------ | -------------------------------------- |
| `topK`      | 返回结果数量 | 5~10 条够用，太多稀释信号              |
| `rerank`    | 启用重排模型 | 关键词 + 语义混合查询时效果显著        |
| `threshold` | 分数阈值     | 0.1 宽松（召回多）、0.5 严格（精度高） |

### 测试数据设计

模块预置了 5 条不同领域的记忆（Rust 编程、花生过敏、宠物猫、九寨沟旅行、GitHub 信息），用三种查询验证搜索效果：

| 查询                     | 类型          | 预期命中        |
| ------------------------ | ------------- | --------------- |
| "用什么语言做高性能开发" | 纯语义        | Rust 日志收集器 |
| "花生过敏 休克"          | 关键词 + 语义 | 花生过敏记录    |
| "家里养了什么动物"       | 宽泛语义      | 宠物猫信息      |

### 运行

```bash
pnpm hybrid-search          # add：添加 5 条测试记忆
pnpm hybrid-search:run      # search：运行三种策略对比
pnpm hybrid-search:cleanup  # 清理测试数据
```

---

## 模块四：mem0-local-api-demo + server.py — 自建 Mem0 REST API

Mem0 Cloud 方便但数据在云端。本模块用 Python 自建 REST API，数据完全私有。

### 架构

```
┌─────────────────────┐     HTTP      ┌──────────────────────────┐
│  mem0-local-api-    │ ────────────▶ │  server.py (FastAPI)     │
│  demo.mjs (Node.js) │               │                          │
│  LocalMem0Client    │ ◀──────────── │  POST   /memories        │
└─────────────────────┘               │  GET    /memories         │
                                      │  POST   /search           │
                                      │  DELETE /memories         │
                                      └──────────┬───────────────┘
                                                 │
                                      ┌──────────▼───────────────┐
                                      │  mem0 (Python SDK)       │
                                      │  ├─ Qdrant (向量存储)     │
                                      │  ├─ LLM (事实提取)        │
                                      │  └─ Embedder (向量化)     │
                                      └──────────────────────────┘
```

### server.py 配置

`server.py` 用 `Memory.from_config()` 初始化，支持任意 OpenAI 兼容的 LLM 和 Embedding：

```python
config = {
    "vector_store": {
        "provider": "qdrant",
        "config": { "embedding_model_dims": EMBEDDING_DIM },
    },
    "llm": {
        "provider": "openai",
        "config": {
            "model": MODEL,           # qwen-plus 等
            "api_key": API_KEY,
            "openai_base_url": BASE_URL,
        },
    },
    "embedder": {
        "provider": "openai",
        "config": {
            "model": EMBEDDING_MODEL,  # text-embedding-v3 等
            "api_key": EMBEDDING_API_KEY,
            "openai_base_url": EMBEDDING_BASE_URL,
            "embedding_dims": EMBEDDING_DIM,
        },
    },
}

m = Memory.from_config(config)
```

### REST API 端点

| 方法   | 路径        | 作用                                          |
| ------ | ----------- | --------------------------------------------- |
| POST   | `/memories` | 添加记忆（自动提取事实）                      |
| GET    | `/memories` | 列出记忆（支持 user_id/run_id/agent_id 过滤） |
| POST   | `/search`   | 语义搜索（支持 filters/top_k/threshold）      |
| DELETE | `/memories` | 删除记忆                                      |

### LocalMem0Client

Node.js 端封装了 `LocalMem0Client`，API 与 `mem0ai` SDK 保持一致：

```js
const client = new LocalMem0Client()

await client.add(messages, { userId: USER_ID })
await client.search('用户的饮食限制', {
  filters: { user_id: USER_ID },
  topK: 5,
})
await client.getAll({ filters: { user_id: USER_ID } })
await client.deleteAll({ userId: USER_ID })
```

### 运行

```bash
# 1. 安装 Python 依赖
pip install mem0ai fastapi uvicorn python-dotenv

# 2. 启动 REST API（默认 8888 端口）
python src/mem0-test/server.py

# 3. 运行 Node.js 客户端
pnpm local-api          # add：添加记忆
pnpm local-api:search   # search：语义搜索
pnpm local-api:list     # list：列出全部记忆
pnpm local-api:cleanup  # 清理测试数据
```

---

## 模块五：mem0-redis-mem0-agent — Redis + Mem0 双层记忆架构

这是最完整的模块：**Redis 管这轮聊天的消息，Mem0 管值得长期留着的事实**，用 LLM 分类器自动决定每轮对话写到哪一层。

### 双层架构

```
用户输入
  │
  ▼
┌──────────────────────────────────────────────────┐
│  invokeWithMemory                                 │
│                                                   │
│  1. Redis 加载历史消息 ──────────────────────────┐│
│  2. Mem0 搜索长期记忆（user 层 + session 层）     ││
│  3. 拼接：[Mem0 SystemMessage] + [Redis 历史] +  ││
│          [当前输入]                               ││
│  4. Agent.invoke（含 summarizationMiddleware）    ││
│  5. Redis 写回消息（过滤 SystemMessage + TTL）    ││
│  6. LLM 分类器：判断本轮是否有新事实              ││
│     ├─ write_user=true  → Mem0 user 层           ││
│     └─ write_session=true → Mem0 session 层      ││
└──────────────────────────────────────────────────┘│
                                                     ▼
┌─────────────────────┐     ┌────────────────────────┐
│  Redis 短期记忆      │     │  Mem0 长期记忆          │
│  (原始消息序列)      │     │  (提取后的关键事实)     │
│  TTL 30min 自动过期  │     │  user 层 + session 层   │
│  summarization 压缩  │     │  语义搜索召回           │
└─────────────────────┘     └────────────────────────┘
```

### LLM 记忆分类器

分类器用 Zod 定义结构化输出 schema，判断每轮对话是否需要写入 Mem0 以及写到哪一层：

```js
const memorySchema = z.object({
  write_user: z
    .boolean()
    .describe('写入用户层：换一个新会话仍应保留的长期事实'),
  write_session: z
    .boolean()
    .describe('写入会话层：仅当前会话/thread 有效的任务、大纲、进度'),
  reason: z.string().describe('分类理由，一句话'),
})
```

分类规则（CLASSIFIER_PROMPT）：

| 层级       | 写入条件                                   | 示例                 |
| ---------- | ------------------------------------------ | -------------------- |
| user 层    | 身份、居住地、长期爱好、饮食过敏、持久偏好 | "我叫小明，住在杭州" |
| session 层 | 当前任务、大纲、进度、待办、临时约定       | "这次先写 Q1 总结"   |
| 均不写入   | 寒暄、致谢、纯确认、助手生成的通用内容     | "谢谢""好的"         |

### Mem0MemoryStore：搜索 + 注入 + 分类写入

```js
class Mem0MemoryStore {
  // 并行搜索 user 层 + session 层
  async search(query) {
    const [userRes, sessionRes] = await Promise.all([
      this.client.search(query, { filters: { user_id: this.userId } }),
      this.client.search(query, {
        filters: { AND: [{ user_id: this.userId }, { run_id: this.sessionId }] },
      }),
    ])
    return { user: userRes.results, session: sessionRes.results }
  }

  // 构建注入 Agent 的 SystemMessage
  buildSystemMessage({ user, session }) {
    const blocks = []
    if (user.length) blocks.push(`【用户长期记忆】\n${user.map(m => `- ${m.memory}`).join('\n')}`)
    if (session.length) blocks.push(`【当前会话记忆】\n${session.map(m => `- ${m.memory}`).join('\n')}`)
    return blocks.length ? new SystemMessage(`${blocks.join('\n\n')}\n\n请结合以上记忆回答`) : null
  }

  // LLM 分类 + 按层级写入
  async classifyAndPersist(userText, assistantText) {
    const { write_user, write_session } = await this.classifier.invoke([...])
    if (write_user) await this.client.add(turn, { userId: this.userId })
    if (write_session) await this.client.add(turn, { userId: this.userId, runId: this.sessionId })
  }
}
```

### invokeWithMemory：读 → 调 → 写 → 分类闭环

```js
async function invokeWithMemory(
  agent,
  redisStore,
  mem0Store,
  sessionId,
  userText,
) {
  // 1. Redis 加载历史
  const history = await redisStore.loadMessages(sessionId)

  // 2. Mem0 搜索长期记忆
  const mem = await mem0Store.search(userText)

  // 3. 拼接注入 + 调用 Agent
  const memoryMsg = mem0Store.buildSystemMessage(mem)
  const result = await agent.invoke({
    messages: [
      ...(memoryMsg ? [memoryMsg] : []),
      ...history,
      new HumanMessage(userText),
    ],
  })

  // 4. Redis 写回（过滤 SystemMessage，带 TTL）
  const redisMessages = messagesForRedis(result.messages)
  await redisStore.saveMessages(sessionId, redisMessages)

  // 5. LLM 分类器判断是否写入 Mem0
  const { written, reason } = await mem0Store.classifyAndPersist(
    userText,
    assistantText,
  )

  return { redisMessages, assistantText }
}
```

### 关键设计决策

| 设计点        | 选择                        | 原因                                         |
| ------------- | --------------------------- | -------------------------------------------- |
| Redis 存什么  | 过滤 SystemMessage 后的消息 | Mem0 注入的 SystemMessage 不需要回存 Redis   |
| Mem0 搜索     | user 层 + session 层并行    | 一次请求同时召回长期和会话级记忆             |
| 分类器模型    | `temperature: 0`            | 分类需要确定性，不需要创造性                 |
| 压缩中间件    | `trigger: 8, keep: 4`       | 超过 8 条触发摘要，保留最近 4 条             |
| Mem0 写入时机 | Agent 回复后                | 需要完整对话（user + assistant）才能判断事实 |

### 交互命令

| 命令                   | 作用                      |
| ---------------------- | ------------------------- |
| 直接输入文本           | 与 Agent 对话             |
| `exit` / `quit` / `:q` | 退出                      |
| `:clear`               | 清空 Redis 短期记忆       |
| `:clear-mem0`          | 清空 Mem0 用户层 + 会话层 |

终端实时显示：Redis 加载/写回消息数、Mem0 召回条数、分类理由、是否触发压缩。

### 运行

```bash
# 1. 启动 Redis（模块五依赖）
cd src/mem0-test && docker compose up -d

# 2. 运行双层记忆 Agent
pnpm agent
```

### 测试对话流程

```
:clear-mem0 → :clear           # 清空两层记忆

你好                           # 寒暄 → Mem0 不写入
我叫小明，住在杭州，喜欢骑行     # 自我介绍 → Mem0 user 层
这次先写 Q1 季度总结            # 当前任务 → Mem0 session 层
我叫什么名字？                  # Redis 历史 → 直接回答

# 重启 Agent（不 :clear-mem0）
我是谁？有什么爱好？            # Redis 空了，但 Mem0 user 层还在 → 认出你
```

---

## 环境变量配置

| 变量                                     | 说明                                          | 使用模块           |
| ---------------------------------------- | --------------------------------------------- | ------------------ |
| `MEM0_API_KEY`                           | Mem0 Cloud API 密钥                           | 模块一、二、三、五 |
| `MEM0_TEST_USER_ID`                      | 基础测试用户 ID                               | 模块一             |
| `MEM0_SCOPED_USER_ID`                    | Scope 测试用户 ID                             | 模块二             |
| `MEM0_SCOPED_RUN_ID`                     | Scope 测试会话 ID                             | 模块二             |
| `MEM0_SCOPED_AGENT_ID`                   | Scope 测试 Agent ID                           | 模块二             |
| `MEM0_HYBRID_USER_ID`                    | 混合搜索测试用户 ID                           | 模块三             |
| `MEM0_LOCAL_BASE_URL`                    | 自建 API 地址（默认 `http://localhost:8888`） | 模块四             |
| `MEM0_LOCAL_API_KEY`                     | 自建 API 鉴权密钥                             | 模块四             |
| `MEM0_LOCAL_USER_ID`                     | 自建 API 测试用户 ID                          | 模块四             |
| `MEM0_LOCAL_TOP_K`                       | 自建 API 搜索返回条数                         | 模块四             |
| `MEM0_USER_ID`                           | 双层 Agent 用户 ID                            | 模块五             |
| `MEM0_SESSION_ID`                        | 双层 Agent 会话 ID                            | 模块五             |
| `MEM0_TOP_K`                             | 双层 Agent 搜索返回条数                       | 模块五             |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_DB` | Redis 连接配置                                | 模块五             |
| `MEMORY_TTL_SECONDS`                     | Redis 消息 TTL                                | 模块五             |
| `MEMORY_KEY_PREFIX`                      | Redis Key 前缀                                | 模块五             |

> 自建模式（模块四）还需要 `API_KEY`、`BASE_URL`、`MODEL`、`EMBEDDING_*` 等变量供 `server.py` 使用。

## 扩展方向

- **多用户并发**：将 `MEM0_USER_ID` / `MEM0_SESSION_ID` 改为动态参数，支持多用户隔离
- **记忆衰减**：为 Mem0 记忆添加时间权重，长期未被召回的记忆自动降权
- **Graph Memory**：利用 Mem0 的 Graph Memory 功能，构建用户实体关系图，增强关联推理
- **批量导入**：将历史对话批量灌入 Mem0，快速构建用户画像
- **与 DeepAgents 结合**：将 `Mem0MemoryStore` 封装为 DeepAgents Middleware，实现框架级记忆注入
- **Qdrant 可视化**：自建模式下用 Qdrant Dashboard 查看向量分布和召回质量

---

⬅️ [Redis Agent 短期记忆](./28-redis-agent-memory.md) ｜ [📚 目录](../../README.md#目录)
