# [DeepAgents] 开箱即用的 Skill、上下文压缩等 Middleware

> DeepAgents 库为 `createAgent` 提供一套可插拔 Middleware：Skills 技能注入、Filesystem 权限沙箱、Memory 持久记忆、Summarization 上下文压缩、SubAgent 多代理委派，以及 `createMiddleware` 自定义扩展。
> **关键词**：deepagents、createSkillsMiddleware、createFilesystemMiddleware、createMemoryMiddleware、createSummarizationMiddleware、createSubAgentMiddleware、createMiddleware

## 核心设计

DeepAgents 的核心理念：**Agent = 模型 + Middleware 组合**。每个 Middleware 负责一块横切关注点，通过 `beforeAgent`、`beforeModel`、`afterModel`、`afterAgent`、`wrapModelCall`、`wrapToolCall` 等钩子注入 Agent 生命周期，零侵入扩展能力。

| 文件                      | Middleware    | 能力                                                                | 关键 API                                                           |
| ------------------------- | ------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `skills-agent.mjs`        | Skills        | 加载 `.agents/skills/` 目录的 SKILL.md，让 Agent 按技能说明完成任务 | `createSkillsMiddleware({ backend, sources })`                     |
| `filesystem-agent.mjs`    | Filesystem    | 沙箱文件操作 + 细粒度权限控制（allow/deny 读写路径）                | `createFilesystemMiddleware({ backend, permissions })`             |
| `memory-agent.mjs`        | Memory        | 持久化项目记忆和用户偏好，跨会话保持上下文                          | `createMemoryMiddleware({ backend, sources })`                     |
| `summarization-agent.mjs` | Summarization | 消息数超阈值时自动压缩历史对话，防止上下文溢出                      | `createSummarizationMiddleware({ model, backend, trigger, keep })` |
| `subagent-agent.mjs`      | SubAgent      | 主 Agent 委派子 Agent（解题/讲解/出题），各司其职                   | `createSubAgentMiddleware({ defaultModel, subagents })`            |
| `middleware-test.mjs`     | 自定义        | 日志统计、上下文注入、敏感词拦截（`jumpTo: 'end'` 短路）            | `createMiddleware({ beforeModel, afterModel, wrapModelCall })`     |
| `middleware-test2.mjs`    | 自定义工具    | 通过 Middleware 注册工具 + `wrapToolCall` 包装执行结果              | `createMiddleware({ tools, wrapToolCall, stateSchema })`           |

## 六大 Middleware 详解

### 1. Skills Middleware — 技能注入

将项目根目录 `.agents/skills/` 下的 SKILL.md 注入 Agent 上下文。Agent 收到任务时自动匹配相关技能，按需 `read_file` 技能说明后执行。

```js
import { createSkillsMiddleware, LocalShellBackend } from 'deepagents'

const backend = await LocalShellBackend.create({ rootDir: projectRoot })
const agent = createAgent({
  model,
  middleware: [
    createSkillsMiddleware({ backend, sources: ['.agents/skills/'] }),
    createFilesystemMiddleware({ backend }),
  ],
})
```

### 2. Filesystem Middleware — 文件沙箱 + 权限

提供 `ls`、`read_file`、`write_file`、`edit_file` 四类工具，通过 `permissions` 数组控制访问：

```js
const permissions = [
  { operations: ['read'], paths: ['/secret.txt'], mode: 'deny' }, // 禁止读
  { operations: ['write'], paths: ['/todo.md'], mode: 'allow' }, // 允许写
  { operations: ['write'], paths: ['/**'], mode: 'deny' }, // 其余全禁
]
```

规则按顺序匹配，先命中先生效；未命中任何规则则默认允许。

### 3. Memory Middleware — 持久记忆

将项目说明（`AGENTS.md`）和用户偏好（`memory/preferences.md`）作为记忆源，Agent 启动时自动加载，用户要求"记住"时实时写入对应文件。

```js
createMemoryMiddleware({
  backend,
  sources: ['/AGENTS.md', '/memory/preferences.md'],
})
```

### 4. Summarization Middleware — 上下文压缩

消息数达到 `trigger` 阈值时，自动用模型将旧消息压缩为摘要，只保留最近 `keep` 条消息，防止上下文窗口溢出：

```js
createSummarizationMiddleware({
  model,
  backend,
  historyPathPrefix: '/conversation_history',
  trigger: { type: 'messages', value: 8 }, // 超过 8 条触发
  keep: { type: 'messages', value: 4 }, // 保留最近 4 条
})
```

摘要文件持久化到 backend，下次对话可继续引用。

### 5. SubAgent Middleware — 多代理委派

主 Agent 不直接执行任务，而是通过 `task` 工具委派给专职子 Agent：

```js
createSubAgentMiddleware({
  defaultModel: model,
  subagents: [
    { name: 'math-solver', description: '解题', tools: [calc, divideEvenly] },
    { name: 'kid-tutor', description: '讲解', tools: [] },
    {
      name: 'practice-maker',
      description: '出练习题',
      tools: [makeSimilarProblem],
    },
  ],
  generalPurposeAgent: false,
})
```

### 6. 自定义 Middleware — createMiddleware

通过 `createMiddleware` 按需组合生命周期钩子：

| 钩子            | 时机           | 典型用途                                           |
| --------------- | -------------- | -------------------------------------------------- |
| `beforeAgent`   | Agent 启动前   | 日志、初始化状态                                   |
| `beforeModel`   | 每次模型调用前 | 注入上下文、敏感词拦截（`jumpTo: 'end'` 短路结束） |
| `afterModel`    | 模型返回后     | 统计调用次数、后处理输出                           |
| `afterAgent`    | Agent 结束后   | 汇总报告                                           |
| `wrapModelCall` | 包装模型调用   | 修改 systemMessage、重试逻辑                       |
| `wrapToolCall`  | 包装工具执行   | 日志、结果增强、状态计数                           |
| `tools`         | 注册额外工具   | 通过 Middleware 注入工具而非 `createAgent.tools`   |
| `stateSchema`   | 自定义状态字段 | 用 Zod 声明 `modelCallCount` 等跨钩子共享状态      |

## 运行方式

```bash
# Skills 技能注入（需要 .agents/skills/excalidraw-diagram-generator）
pnpm dev src/deep-agents/src/deepagents/skills-agent.mjs

# Filesystem 沙箱权限
pnpm dev src/deep-agents/src/deepagents/filesystem-agent.mjs

# Memory 持久记忆
pnpm dev src/deep-agents/src/deepagents/memory-agent.mjs

# Summarization 上下文压缩
pnpm dev src/deep-agents/src/deepagents/summarization-agent.mjs

# SubAgent 多代理委派
pnpm dev src/deep-agents/src/deepagents/subagent-agent.mjs

# 自定义 Middleware（日志/拦截/上下文注入）
pnpm dev src/deep-agents/src/middleware-test.mjs

# 自定义 Middleware（工具注册 + wrapToolCall）
pnpm dev src/deep-agents/src/middleware-test2.mjs
```

需在根目录 `.env` 配置 `MODEL`、`API_KEY`、`BASE_URL`。

## 扩展方向

- 组合多个 Middleware：Skills + Memory + Summarization，构建带持久记忆的长对话技能 Agent
- 用 `wrapModelCall` 实现自动重试 + 降级策略，替代手写 try-catch
- 在 SubAgent 模式中引入 checkpointer，实现子 Agent 跨会话状态恢复
- 用 `stateSchema` 声明业务状态（如 `costTracking`），实现 Token 成本监控 Middleware

---

⬅️ [LangSmith 观测](./24-langsmith-observability.md) ｜ [📚 目录](../../README.md#目录) ｜ ➡️
