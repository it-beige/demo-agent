# [Memory·Redis] Redis：实现 Agent 短期记忆存储的最佳方案

> Redis 凭借亚毫秒延迟、TTL 自动过期、AOF 持久化三大特性，成为 Agent 短期记忆（会话级消息存储）的最佳工程方案。本章用两个模块演示从 Redis 基础操作到完整的 Agent 会话记忆管理：`redis-test.mjs` 覆盖六大核心数据类型，`agent-with-redis-memory.mjs` 实现带 TTL 过期和自动压缩的 Agent 短期记忆。
> **关键词**：ioredis、TTL 过期、会话记忆、summarizationMiddleware、消息序列化、Redis Insight

## 为什么选 Redis 做 Agent 短期记忆

Agent 的短期记忆（一次会话内的对话历史）有几个核心需求：读写极快、支持自动过期、重启不丢失。对比常见方案：

| 方案             | 延迟       | 持久化      | 自动过期 | 适用场景              |
| ---------------- | ---------- | ----------- | -------- | --------------------- |
| 内存（InMemory） | 极低       | ❌          | ❌       | 测试、单次对话        |
| 文件系统         | 低         | ✅          | ❌       | 单机简单场景          |
| **Redis**        | **亚毫秒** | **AOF/RDB** | **TTL**  | **会话级短期记忆**    |
| PostgreSQL       | 毫秒级     | ✅          | 需手写   | 长期记忆 + 结构化查询 |
| Milvus           | 毫秒级     | ✅          | 需手写   | 向量检索 + 语义召回   |

Redis 的核心优势：

1. **亚毫秒读写**：对话历史每轮都要读 → 拼 → 写，延迟敏感
2. **TTL 原生过期**：会话 30 分钟无活动自动清理，无需定时任务
3. **AOF 持久化**：Docker 重启后记忆恢复，开发体验好
4. **JSON 序列化**：LangChain 提供 `mapChatMessagesToStoredMessages` / `mapStoredMessagesToChatMessages` 标准转换

## 架构总览

```
┌──────────┐    invoke 前     ┌──────────────────┐
│  用户输入  │ ──────────────▶ │ 从 Redis 加载历史  │
└──────────┘                 └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  Agent invoke     │
                             │  (含压缩中间件)    │
                             └────────┬─────────┘
                                      │
                          invoke 后    ▼
                             ┌──────────────────┐
                             │ 写回 Redis + TTL  │
                             └──────────────────┘
```

## 模块一：redis-test — Redis 六大核心数据类型

### 代码结构

```
src/redis-test/
├── docker-compose.yml     # Redis 7 + RedisInsight 容器编排
├── src/
│   ├── redis-test.mjs     # 六大数据类型 + 分布式锁演示
│   └── agent-with-redis-memory.mjs  # Agent 短期记忆完整实现
├── volumes/
│   └── redis/             # AOF 持久化数据目录
└── redis-data-types.md    # Redis 数据类型速查手册
```

### 技术栈

| 组件   | 技术              | 作用                               |
| ------ | ----------------- | ---------------------------------- |
| 数据库 | Redis 7 Alpine    | Docker Compose 一键启动            |
| GUI    | RedisInsight 2.50 | `http://localhost:5540` 可视化管理 |
| 客户端 | `ioredis`         | Node.js Redis 客户端               |
| 持久化 | AOF（appendonly） | 容器重启后数据恢复                 |

### 六大核心操作

`redis-test.mjs` 演示了 Agent 开发中最常用的 Redis 数据类型：

```js
// String：最简单的 KV 存储，适合验证码、Token、对话摘要
await redis.set('code', '6666', 'EX', 300) // 5 分钟过期

// Hash：结构化数据，适合用户信息、会话上下文
await redis.hset('user:1001', 'name', '李四', 'age', 28)

// List：有序列表，适合任务队列、聊天历史
await redis.rpush('task:list', '任务1', '任务2')

// Set：无序去重集合，适合标签、黑名单
await redis.sadd('tag:set', 'redis', 'nest', 'node')

// ZSet：有序集合，适合排行榜、权重队列
await redis.zadd('score:rank', 99, '小明', 95, '小红')

// 分布式锁：NX + EX 组合，防止并发冲突
await redis.set('lock:order:1001', 'locked', 'NX', 'EX', 10)
```

### 运行方式

```bash
# 1. 启动 Redis + RedisInsight
cd src/redis-test && docker compose up -d

# 2. 运行数据类型演示
pnpm dev src/redis-test/src/redis-test.mjs
```

## 模块二：agent-with-redis-memory — Agent 短期记忆

### 核心类：RedisMessageStore

`RedisMessageStore` 封装了 Agent 消息的 Redis 存取逻辑，三个核心方法：

```js
class RedisMessageStore {
  // 读：JSON.parse → mapStoredMessagesToChatMessages 还原为 LangChain Message 对象
  async loadMessages(sessionId) {
    const raw = await this.redis.get(`${prefix}:${sessionId}:messages`)
    return raw ? mapStoredMessagesToChatMessages(JSON.parse(raw)) : []
  }

  // 写：mapChatMessagesToStoredMessages → JSON.stringify → SET + EX(TTL)
  async saveMessages(sessionId, messages) {
    const payload = JSON.stringify(mapChatMessagesToStoredMessages(messages))
    await this.redis.set(key, payload, 'EX', this.ttlSeconds)
  }

  // 清空：用于重置会话
  async clear(sessionId) {
    await this.redis.del(key)
  }
}
```

**设计要点**：

| 设计决策 | 选择                                      | 原因                                                         |
| -------- | ----------------------------------------- | ------------------------------------------------------------ |
| 存储格式 | String（JSON）                            | 消息列表天然适合整体读写，JSON 序列化兼容 LangChain 标准     |
| Key 设计 | `agent:short_memory:{sessionId}:messages` | 前缀 + 会话隔离 + 资源类型，便于批量管理和清理               |
| 过期策略 | `SET ... EX ttlSeconds`                   | 每次写入重置 TTL，活跃会话永不过期，沉默会话自动清理         |
| 默认 TTL | 1800 秒（30 分钟）                        | 覆盖大多数对话场景，可通过 `MEMORY_TTL_SECONDS` 环境变量调整 |

### invokeWithMemory：读 → 调 → 写 闭环

```js
async function invokeWithMemory(agent, store, sessionId, userText) {
  // 1. 从 Redis 加载历史消息
  const history = await store.loadMessages(sessionId)

  // 2. 拼接历史 + 当前输入，调用 Agent
  const result = await agent.invoke(
    { messages: [...history, new HumanMessage(userText)] },
    { recursionLimit: 30 },
  )

  // 3. 将完整消息列表写回 Redis（覆盖式，带 TTL）
  await store.saveMessages(sessionId, result.messages)

  return result
}
```

每次 invoke 后**覆盖写入**整个消息列表，而非追加——因为 `summarizationMiddleware` 会压缩历史消息，覆盖写入保证 Redis 中始终存储压缩后的最新版本。

### Summarization 压缩中间件

当消息数超过阈值时，`summarizationMiddleware` 自动将旧消息压缩为摘要，防止上下文溢出：

```js
const agent = createAgent({
  model,
  middleware: [
    summarizationMiddleware({
      model,
      summaryPrompt, // 中文摘要提示词
      trigger: { messages: 8 }, // 超过 8 条触发压缩
      keep: { messages: 4 }, // 保留最近 4 条
    }),
  ],
})
```

压缩过程在 Agent 内部完成，`invokeWithMemory` 拿到的 `result.messages` 已经是压缩后的结果，直接写回 Redis 即可。

**摘要提示词**要求模型用中文总结，保留用户明确说过的关键事实（姓名、偏好、日期等），不编造不遗漏。

### 环境变量配置

| 变量                 | 默认值               | 说明                |
| -------------------- | -------------------- | ------------------- |
| `REDIS_HOST`         | `localhost`          | Redis 主机          |
| `REDIS_PORT`         | `6379`               | Redis 端口          |
| `REDIS_DB`           | `0`                  | Redis 数据库编号    |
| `MEMORY_TTL_SECONDS` | `1800`               | 会话 TTL（秒）      |
| `MEMORY_KEY_PREFIX`  | `agent:short_memory` | Redis Key 前缀      |
| `MEMORY_SESSION_ID`  | `demo_user_001`      | 会话 ID（用户隔离） |

### 运行方式

```bash
# 1. 确保 Redis 容器已启动
cd src/redis-test && docker compose up -d

# 2. 运行交互式 Agent（支持多轮对话）
pnpm dev src/redis-test/src/agent-with-redis-memory.mjs
```

交互命令：

| 命令                   | 作用             |
| ---------------------- | ---------------- |
| 直接输入文本           | 与 Agent 对话    |
| `exit` / `quit` / `:q` | 退出             |
| `:clear`               | 清空当前会话记忆 |

终端会实时显示：加载的历史消息数、写回的消息数、当前 TTL、是否触发了压缩（`⚡ 已触发压缩`）。

## RedisInsight 可视化管理

RedisInsight 是 Redis 官方的 Web GUI（类似 pgAdmin），访问 `http://localhost:5540`：

1. **Browser**：浏览所有 Key，查看 Agent 会话消息的 JSON 内容
2. **TTL 监控**：观察 Key 的剩余过期时间，验证 TTL 机制
3. **CLI**：内置命令行，直接执行 `GET agent:short_memory:demo_user_001:messages`
4. **数据浏览器**：可视化 String / Hash / List / Set / ZSet 等各种类型

## 两种消息序列化 API

LangChain 提供了标准的消息序列化/反序列化工具，确保消息在 Redis 中存储为 JSON 后能正确还原：

```js
import {
  mapChatMessagesToStoredMessages, // Message[] → 可序列化的普通对象[]
  mapStoredMessagesToChatMessages, // 普通对象[] → Message[]（还原类型信息）
} from '@langchain/core/messages'
```

**为什么需要转换**：LangChain 的 `HumanMessage`、`AIMessage` 等是类实例，直接 `JSON.stringify` 会丢失类型信息。`mapChatMessagesToStoredMessages` 将类实例转为带 `type` 字段的普通对象，反序列化时 `mapStoredMessagesToChatMessages` 根据 `type` 还原为对应的类实例。

## 扩展方向

- **多用户隔离**：将 `SESSION_ID` 改为动态参数（如用户 ID），支持多用户并发会话
- **Redis Streams**：用 Stream 替代 String 存储消息列表，支持消费者组和消息确认
- **Redis + 向量检索**：利用 Redis Stack 的 RediSearch 模块实现向量语义检索，将短期记忆升级为可检索记忆
- **分布式部署**：多个 Agent 实例共享同一 Redis，实现会话级负载均衡
- **与 Memory Middleware 结合**：将 `RedisMessageStore` 封装为 DeepAgents Middleware，实现持久记忆 + Redis 短期记忆的双层架构

---

⬅️ [PostgreSQL AI 数据库](./27-postgresql-ai-database.md) ｜ [📚 目录](../../README.md#目录) ｜ [Mem0 记忆方案 ➡️](./29-mem0-memory.md)
