# demo-agent

> 项目中涉及到的最小demo示例仓库，用来理解两类常见 AI 应用形态：
>
> 1. **Agent**：让模型结合本地工具完成一个实际任务
> 2. **MCP Server**：把本地能力封装成标准化工具，供 Cursor 等 MCP Client 调用

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置 .env
echo 'MODEL=deepseek-chat
API_KEY=sk-xxx
BASE_URL=https://api.deepseek.com/v1' > .env

# 3. 跑第一个 demo
node agent-react-todo.mjs
```

> 完整环境变量（向量检索 / 高德地图 / 邮件 / 搜索 / MySQL / 腾讯云）见 [快速开始](./docs/getting-started.md)。

## 目录

| #   | 标签               | 章节                                                                                                     | 一句话                                                     |
| --- | ------------------ | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | [Agent]            | [ReAct 循环与本地工具调用](./docs/chapters/01-agent-basic.md)                                            | Agent 核心闭环：思考→行动→观察                             |
| 2   | [MCP]              | [MCP Server 基础](./docs/chapters/02-mcp-server-basic.md)                                                | Tool/Resource 定义、stdio 通信                             |
| 3   | [MCP·Client]       | [多 MCP Server 集成](./docs/chapters/03-multi-mcp.md)                                                    | 高德地图 + filesystem 双 MCP                               |
| 4   | [RAG]              | [RAG 检索增强生成](./docs/chapters/04-rag.md)                                                            | Embeddings 降级、关键词兜底                                |
| 5   | [RAG·Pipeline]     | [动态网站内容提取](./docs/chapters/05-dynamic-content.md)                                                | Puppeteer 动态渲染                                         |
| 6   | [RAG·Pipeline]     | [兼容性加载方案](./docs/chapters/06-compatibility-loader.md)                                             | Cheerio → Puppeteer 渐进降级                               |
| 7   | [RAG·Pipeline]     | [文本分割器多策略调优](./docs/chapters/07-text-splitter.md)                                              | 按字符/递归/Token/代码语言切分                             |
| 8   | [Memory]           | [对话记忆管理](./docs/chapters/08-conversation-memory.md)                                                | 截断、总结、检索三大策略                                   |
| 9   | [StructuredOutput] | [结构化大模型输出](./docs/chapters/09-structured-output.md)                                              | JSON.parse → Zod → withStructuredOutput                    |
| 10  | [Agent·实战]       | [智能录入 + Mini Cursor](./docs/chapters/10-smart-import-mini-cursor.md)                                 | MySQL 实战、流式 ReAct                                     |
| 11  | [PromptTemplate]   | [提示词组件化](./docs/chapters/11-prompt-template.md)                                                    | Pipeline、Few-Shot、动态示例选择                           |
| 12  | [Runnable]         | [声明式 Chain 组装](./docs/chapters/12-runnable-chain.md)                                                | Sequence/Map/Branch/重试/降级                              |
| 13  | [NestJS·SSE]       | [Nest + LangChain SSE 流式](./docs/chapters/13-nest-langchain-sse.md)                                    | 后端逐字输出→前端打字机渲染                                |
| 14  | [NestJS·Agent]     | [Nest + Tool Calling](./docs/chapters/14-nest-tool-calling.md)                                           | ReAct 循环 + 三工具 + 流式混合                             |
| 15  | [NestJS·Cron]      | [AI 定时任务](./docs/chapters/15-nest-cron-job.md)                                                       | 自然语言描述→自动调度执行                                  |
| 16  | [AGUI·全栈]        | [AGUI 流式组件渲染](./docs/chapters/16-agui-protocol.md)                                                 | ChatGPT 风格工具调用面板                                   |
| 17  | [语音·TTS/ASR]     | [实时语音助手](./docs/chapters/17-nest-tts-asr.md)                                                       | 双 WebSocket 中继 + MediaSource 流式播放                   |
| 18  | [LangGraph]        | [图形编排与多 Agent](./docs/chapters/18-langgraph-multi-agent.md)                                        | StateGraph → 条件路由 → HITL → Supervisor                  |
| 19  | [RAG·Agentic]      | [Agentic RAG 闭环](./docs/chapters/19-agentic-rag.md)                                                    | 查询路由→子问题拆解→多跳→联网兜底                          |
| 20  | [Deploy]           | [基于 Docker Compose 的本地开发环境和生产环境部署](./docs/chapters/20-docker-compose-deploy.md)          | 一键拉起开发 + 生产部署方案                                |
| 21  | [Retrieval]        | [ElasticSearch 全文检索：倒排索引 + IK 分词器 + BM25 算法](./docs/chapters/21-elasticsearch-fulltext.md) | 倒排索引+IK分词器+BM25算法                                 |
| 22  | [RAG·Hybrid]       | 混合检索 RAG：多路召回 + 重排模型                                                                        | ES + Milvus 双路 → 去重 → Rerank → 生成                    |
| 23  | [Rerank]           | DashScope Rerank 重排模型                                                                                | 阿里云重排 API 封装 + LangChain 集成                       |
| 24  | [Observability]    | [LangSmith 全链路观测：从 Agent 调试到 RAG 量化评估](./docs/chapters/24-langsmith-observability.md)      | Tracing 零侵入 + OpenEvals 三维度 RAG 评测                 |
| 25  | [DeepAgents]       | [开箱即用的 Skill、上下文压缩等 Middleware](./docs/chapters/25-deepagents-middleware.md)                 | Skills/Memory/Summarization/SubAgent/Filesystem Middleware |
| 26  | [DeepAgents·实战]  | [DeepAgents 实战：多 Agent 架构的深度调研助手](./docs/chapters/26-deep-research-assistant.md)            | createDeepAgent + 多子 Agent 协作 + Tavily 联网搜索        |
| 27  | [Database]         | [PostgreSQL：AI 时代最适合的数据库](./docs/chapters/27-postgresql-ai-database.md)                        | pgvector 向量检索 + 原生 SQL / TypeORM 双方案              |

## 推荐主线

第一次接触建议走这条路径，5 个章节覆盖核心能力：

```
[Agent] 01 → [RAG] 04 → [Memory] 08 → [NestJS·Agent] 14 → [RAG·Agentic] 19 → [RAG·Hybrid] 22 → [Observability] 24
```

## 核心模块速览

| 模块                                       | 章节                                | 说明                           |
| ------------------------------------------ | ----------------------------------- | ------------------------------ |
| `agent-react-todo.mjs`                     | [Agent] 01                          | ReAct 循环入口                 |
| `src/mcp-server.mjs`                       | [MCP] 02                            | MCP Server 实现                |
| `src/mcp-amap.mjs`                         | [MCP·Client] 03                     | 多 MCP Client                  |
| `src/memory/`                              | [Memory] 08                         | 对话记忆管理                   |
| `src/output-parse/`                        | [StructuredOutput] 09               | 结构化输出                     |
| `src/prompt-template/`                     | [PromptTemplate] 11                 | 提示词组件化                   |
| `src/runnable/`                            | [Runnable] 12                       | Chain 组装                     |
| `src/asr-and-tts-nest-service/`            | [NestJS·SSE] 13                     | SSE 流式                       |
| `src/cron-job-tool/`                       | [NestJS·Agent] 14, [NestJS·Cron] 15 | Tool Calling + 定时任务        |
| `src/agui-backend/` + `src/agui-frontend/` | [AGUI·全栈] 16                      | AGUI 全栈                      |
| `src/tts-stt-nest/`                        | [语音·TTS/ASR] 17                   | 语音助手                       |
| `src/langgraph/`                           | [LangGraph] 18                      | 图形编排                       |
| `src/advanced-rag/`                        | [RAG·Agentic] 19                    | Agentic RAG                    |
| `src/elastic-search/`                      | [Retrieval] 21                      | ElasticSearch 全文检索         |
| `src/elastic-search/src/rag/`              | [RAG·Hybrid] 22                     | 混合检索 RAG                   |
| `src/elastic-search/src/rerank/`           | [Rerank] 23                         | DashScope 重排模型             |
| `src/smith-langchian/`                     | [Observability] 24                  | LangSmith 全链路观测           |
| `src/deep-agents/`                         | [DeepAgents] 25                     | Middleware 可插拔体系          |
| `src/deep-research-assistant/`             | [DeepAgents·实战] 26                | 多 Agent 深度调研助手          |
| `src/pgsql-test/`                          | [Database] 27                       | PostgreSQL + pgvector 向量检索 |
| `src/typeorm-pg-crud/`                     | [Database] 27                       | TypeORM + NestJS CRUD API      |

## 进一步阅读

| 文档                                                               | 说明                         |
| ------------------------------------------------------------------ | ---------------------------- |
| [快速开始](./docs/getting-started.md)                              | 环境配置、完整环境变量表     |
| [项目结构](./docs/project-structure.md)                            | 模块与章节对应索引           |
| [核心概念](./docs/concepts.md)                                     | Agent/MCP 辨析、内置工具说明 |
| [学习路径](./docs/learning-path.md)                                | 各主题由浅入深路径           |
| [进阶方向](./docs/exercises.md)                                    | 每章进阶探索                 |
| [踩坑记录](./docs/troubleshooting.md)                              | 真实坑点                     |
| [后续规划](./docs/roadmap.md)                                      | 后续深挖方向                 |
| [Docker Compose 部署](./docs/chapters/20-docker-compose-deploy.md) | 本地开发 + 生产环境一键部署  |
