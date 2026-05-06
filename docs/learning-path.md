# 推荐学习顺序

> 按"由浅入深"组织，跟着读完即可建立完整知识体系。

## 快速入门

1. `src/mcp-server.mjs` — 理解 MCP Server 最小结构
2. `src/tools/` — 理解本地工具封装
3. `src/tool-runner.mjs` — 理解工具调用循环
4. `src/index.mjs` → Agent 接任务并驱动流程

## 推荐主线：4 个最关键的章节

| 顺序 | 章节 | 学什么 |
|------|------|--------|
| 1 | [Agent] 01 | ReAct 循环，Agent 核心闭环 |
| 4 | [RAG·Pipeline] 04-06 | RAG 完整管线 |
| 8 | [Memory] 08 | 对话记忆：截断/总结/检索 |
| 14 | [NestJS·Agent] 14 | NestJS 中的 Tool Calling |
| 19 | [RAG·Agentic] 19 | Agentic RAG 自主决策 |

## 各主题路径

### [StructuredOutput] 09

手动解析 → `JsonOutputParser` → `StructuredOutputParser` → Zod Schema → `withStructuredOutput` → 流式 → Tool Calls → XML

### [PromptTemplate] 11

基础模板 → `PipelinePromptTemplate` → `.partial()` → `ChatPromptTemplate` → `FewShotPromptTemplate` → 动态示例选择 → Milvus 语义检索

### [Runnable] 12

`RunnableSequence` → `RunnableMap`/`RunnableBranch`/`RunnableRoute` → `RunnableWithRetry`/`RunnableWithFallbacks` → `RunnableWithMessageHistory`

### [NestJS·SSE] 13

`AiService` Chain 构建 → `AiController` SSE 端点 → `AiModule` 工厂注入 → `ConfigModule` 环境变量 → 前端 EventSource

### [NestJS·Agent] 14

`user.service.ts` 内存数据库 → `ai.module.ts` 工具注册 → `ai.service.ts` ReAct 循环 + 流式 → `ai.controller.ts` 双端点

### [语音·TTS/ASR] 17

`speech.service.ts` ASR → `ai.service.ts` 流式 + 事件发布 → `tts-relay.service.ts` 双 WebSocket 中继 → `tts.gateway.ts` 薄封装 → 前端 MediaSource

### [LangGraph] 18

`basic-graph.mjs` → `conditional-routing.mjs` → `loop-retry.mjs` → `checkpointer-memory.mjs` → `graph-interrupt.mjs` → `prebuilt-tool-node.mjs` → `prebuilt-agent.mjs` → `multi-agent-supervisor.mjs`

## ➡️ 下一步

- 📚 回到 [目录](./../README.md#目录)
- ✏️ 查看 [建议动手练习](./exercises.md)