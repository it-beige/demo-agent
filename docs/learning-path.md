# 推荐学习顺序

> 按"由浅入深"组织，跟着读完即可建立完整知识体系。

## 快速入门

1. `src/mcp-server.mjs` — 理解 MCP Server 最小结构
2. `src/tools/` — 理解本地工具封装
3. `src/tool-runner.mjs` — 理解工具调用循环
4. `src/index.mjs` → Agent 接任务并驱动流程

## 推荐主线：4 个最关键的章节

| 顺序 | 章节                 | 学什么                            |
| ---- | -------------------- | --------------------------------- |
| 1    | [Agent] 01           | ReAct 循环，Agent 核心闭环        |
| 4    | [RAG·Pipeline] 04-06 | RAG 完整管线                      |
| 8    | [RAG·Vector] 08      | Milvus 向量库：CRUD + 电子书 RAG  |
| 9    | [Memory] 09          | 对话记忆：截断/总结/检索          |
| 15   | [NestJS·Agent] 15    | NestJS 中的 Tool Calling          |
| 20   | [RAG·Agentic] 20     | Agentic RAG 自主决策              |
| 21   | [GraphRAG] 21        | Neo4j 知识图谱 + Graph RAG        |
| 25   | [Observability] 25   | LangSmith 链路追踪 + RAG 量化评测 |
| 26   | [DeepAgents] 26      | Skills/Memory/SubAgent Middleware |
| 27   | [DeepAgents·实战] 27 | 多 Agent 深度调研助手实战         |
| 28   | [Database] 28        | PostgreSQL + pgvector 向量检索    |
| 29   | [Memory·Redis] 29    | Redis Agent 短期记忆 + TTL 过期   |
| 30   | [Memory·Mem0] 30     | Mem0 长期记忆 + Redis 双层架构    |

## 各主题路径

### [RAG·Vector] 08

`ai-diary/insert.mjs` 建集合 + 建索引 + 插入 → `query.mjs`/`list.mjs` 向量检索与标量过滤 → `update.mjs`（upsert）/`delete.mjs` → `rag.mjs` 检索增强问答；`book-test/ebook-writer.mjs` EPUB 断点续传入库 → `ebook-reader-rag.mjs` 小说问答 → `ebook-batch-writer.mjs` 阿里云批处理 embedding

### [StructuredOutput] 10

手动解析 → `JsonOutputParser` → `StructuredOutputParser` → Zod Schema → `withStructuredOutput` → 流式 → Tool Calls → XML

### [PromptTemplate] 12

基础模板 → `PipelinePromptTemplate` → `.partial()` → `ChatPromptTemplate` → `FewShotPromptTemplate` → 动态示例选择 → Milvus 语义检索

### [Runnable] 13

`RunnableSequence` → `RunnableMap`/`RunnableBranch`/`RunnableRoute` → `RunnableWithRetry`/`RunnableWithFallbacks` → `RunnableWithMessageHistory`

### [NestJS·SSE] 14

`AiService` Chain 构建 → `AiController` SSE 端点 → `AiModule` 工厂注入 → `ConfigModule` 环境变量 → 前端 EventSource

### [NestJS·Agent] 15

`user.service.ts` 内存数据库 → `ai.module.ts` 工具注册 → `ai.service.ts` ReAct 循环 + 流式 → `ai.controller.ts` 双端点

### [语音·TTS/ASR] 18

`speech.service.ts` ASR → `ai.service.ts` 流式 + 事件发布 → `tts-relay.service.ts` 双 WebSocket 中继 → `tts.gateway.ts` 薄封装 → 前端 MediaSource

### [LangGraph] 19

`basic-graph.mjs` → `conditional-routing.mjs` → `loop-retry.mjs` → `checkpointer-memory.mjs` → `graph-interrupt.mjs` → `prebuilt-tool-node.mjs` → `prebuilt-agent.mjs` → `multi-agent-supervisor.mjs`

### [GraphRAG] 21

`docker-compose.yml` 启动 Neo4j → `cypher.md` 理解图谱 Schema → `seed-neo4j.mjs` 导入数据 → `graphrag.mjs` Cypher 生成 + 图查询 + 答案生成

### [Observability] 25

环境变量开启 Tracing → LangSmith Run 树查看 → `build_dataset.mjs` 构建评测集 → `evaluators.mjs` 三大 OpenEvals 指标 → `run_eval.mjs` 跑实验 → LangSmith UI 查看报告

### [DeepAgents] 26

`filesystem-agent.mjs` 沙箱权限 → `memory-agent.mjs` 持久记忆 → `summarization-agent.mjs` 上下文压缩 → `skills-agent.mjs` 技能注入 → `subagent-agent.mjs` 四步子 Agent 流水线（解题→讲解→出题→评分）→ `middleware-test.mjs` 自定义扩展

### [DeepAgents·实战] 27

`agent.mjs` createDeepAgent 高层封装 → researcher/editor/analyst 三类子 Agent → `tools/search.mjs` Tavily 联网搜索 → `cli.mjs` 流式输出 + 子图监听 → Skills 技能注入（web-research / report-writer）→ 完整调研报告交付

### [Database] 28

`docker-compose.yml` 启动 PostgreSQL + pgvector → `create_tables.sql` 建表 + HNSW 索引 → `pgsql-test` 原生 SQL CRUD + 语义检索 → `typeorm-pg-crud` TypeORM 实体映射 + NestJS RESTful API

### [Memory·Redis] 29

`docker-compose.yml` 启动 Redis 7 + RedisInsight → `redis-test.mjs` 六大数据类型 + 分布式锁 → `agent-with-redis-memory.mjs` RedisMessageStore + invokeWithMemory 读-调-写闭环 + summarizationMiddleware 自动压缩

### [Memory·Mem0] 30

`mem0-test.mjs` Cloud API 基础 CRUD → `mem0-scoped-memory-test.mjs` user/session/agent 三种 Scope → `mem0-hybrid-search-test.mjs` rerank/threshold 混合搜索 → `server.py` + `mem0-local-api-demo.mjs` 自建 REST API（Qdrant + 自定义 LLM）→ `mem0-redis-mem0-agent.mjs` Redis 短期 + Mem0 长期双层记忆 + LLM 分类器自动分层

## ➡️ 下一步

- 📚 回到 [目录](./../README.md#目录)
- 📈 查看 [进阶方向](./exercises.md)
