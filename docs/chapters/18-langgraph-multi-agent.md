# [LangGraph] 图形编排引擎与多 Agent 架构

> 用 StateGraph 声明式编排 AI 工作流：线性流 → 条件路由 → 循环重试 → 检查点 → 人工干预 → Tool Calling → 多 Agent Supervisor 调度。
> **关键词**：StateGraph、条件边、MemorySaver、interrupt、Supervisor、Mermaid

## 核心设计

这个 demo 按递进顺序覆盖了 LangGraph 的完整能力图谱：

| 文件 | 能力 | 关键 API |
|------|------|----------|
| `basic-graph.mjs` | 最简线性流 | `Annotation.Root` → `addNode` → `addEdge` |
| `conditional-routing.mjs` | 条件路由 | `addConditionalEdges` 按状态选下一节点 |
| `loop-retry.mjs` | 循环重试 | 节点指回自身 + `recursionLimit` |
| `checkpointer-memory.mjs` | 会话隔离 | `MemorySaver` + 不同 `thread_id` |
| `graph-interrupt.mjs` | 人工干预 | `interrupt()` 暂停 → `Command` 恢复 |
| `prebuilt-tool-node.mjs` | Tool Calling | `MessagesAnnotation` + `ToolNode` + `toolsCondition` |
| `prebuilt-agent.mjs` | 封装版 Agent | `createAgent` 一行搞定 |
| `multi-agent-supervisor.mjs` | 多 Agent | `createSupervisor` 调度 weather/trivia 子代理 |

核心设计抉择：**手写 StateGraph vs createAgent**。手写图适合需要精细控制（自定义循环、中断逻辑），`createAgent` 适合快速原型。多 Agent Supervisor 模式是生产级复杂 AI 系统的关键——拆成多个职责单一的子 Agent + 一个 Supervisor 调度，比单 Agent 更可控。

每个示例都会打印 Mermaid 流程图，可直接粘贴到 <https://mermaid.live> 可视化。

## 运行方式

```bash
pnpm dev src/langgraph/src/basic-graph.mjs
pnpm dev src/langgraph/src/conditional-routing.mjs
pnpm dev src/langgraph/src/loop-retry.mjs
pnpm dev src/langgraph/src/checkpointer-memory.mjs
pnpm dev src/langgraph/src/graph-interrupt.mjs
pnpm dev src/langgraph/src/prebuilt-tool-node.mjs
pnpm dev src/langgraph/src/prebuilt-agent.mjs
pnpm dev src/langgraph/src/multi-agent-supervisor.mjs
```

涉及大模型调用的示例（最后 3 个）需在根目录 `.env` 配置 `MODEL`、`API_KEY`、`BASE_URL`。

## 扩展方向

- 在 Supervisor 基础上新增第三个子 Agent（如 news_agent），观察 Supervisor 调度策略变化
- 将 `interrupt()` 的终端输入改为 HTTP 端点审批，模拟 Web 应用的人工审批流程
- 把 checkpointer 从 MemorySaver 换成文件持久化或数据库存储

---
⬅️ [实时语音助手](./17-nest-tts-asr.md) ｜ [📚 目录](../../README.md#目录) ｜ [Agentic RAG ➡️](./19-agentic-rag.md)