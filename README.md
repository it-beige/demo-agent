# demo-agent

> 项目中涉及到的最小demo示例仓库，用来理解两类常见 AI 应用形态：
>
> 1. **Agent**：让模型结合本地工具(Memory、Tool、RAG、Search)完成AI应用开发
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
| 4   | [RAG]              | [RAG 检索增强生成](./docs/chapters/04-rag.md)                                                            | Embeddings 降级 + 引用溯源标注                             |
| 5   | [RAG·Pipeline]     | [动态网站内容提取](./docs/chapters/05-dynamic-content.md)                                                | Puppeteer 动态渲染                                         |
| 6   | [RAG·Pipeline]     | [兼容性加载方案](./docs/chapters/06-compatibility-loader.md)                                             | Cheerio → Puppeteer 渐进降级                               |
| 7   | [RAG·Pipeline]     | [文本分割器多策略调优](./docs/chapters/07-text-splitter.md)                                              | 递归/Token/代码/Markdown/LaTeX 切分                        |
| 8   | [RAG·Vector]       | [Milvus 向量数据库：从 CRUD 到电子书 RAG](./docs/chapters/08-milvus-vector-db.md)                        | 日记 CRUD + 天龙八部 RAG + 阿里云批处理入库                |
| 9   | [Memory]           | [对话记忆管理](./docs/chapters/09-conversation-memory.md)                                                | 截断、总结、检索三大策略                                   |
| 10   | [StructuredOutput] | [结构化大模型输出](./docs/chapters/10-structured-output.md)                                              | JSON.parse → Zod → withStructuredOutput                    |
| 11  | [Agent·实战]       | [智能录入 + Mini Cursor](./docs/chapters/11-smart-import-mini-cursor.md)                                 | MySQL 实战、流式 ReAct                                     |
| 12  | [PromptTemplate]   | [提示词组件化](./docs/chapters/12-prompt-template.md)                                                    | Pipeline、Few-Shot、动态示例选择                           |
| 13  | [Runnable]         | [声明式 Chain 组装](./docs/chapters/13-runnable-chain.md)                                                | Sequence/Map/Branch/重试/降级                              |
| 14  | [NestJS·SSE]       | [Nest + LangChain SSE 流式](./docs/chapters/14-nest-langchain-sse.md)                                    | 后端逐字输出→前端打字机渲染                                |
| 15  | [NestJS·Agent]     | [Nest + Tool Calling](./docs/chapters/15-nest-tool-calling.md)                                           | ReAct 循环 + 三工具 + 流式混合                             |
| 16  | [NestJS·Cron]      | [AI 定时任务](./docs/chapters/16-nest-cron-job.md)                                                       | 自然语言描述→自动调度执行                                  |
| 17  | [AGUI·全栈]        | [AGUI 流式组件渲染](./docs/chapters/17-agui-protocol.md)                                                 | ChatGPT 风格工具调用面板                                   |
| 18  | [语音·TTS/ASR]     | [实时语音助手](./docs/chapters/18-nest-tts-asr.md)                                                       | 双 WebSocket 中继 + MediaSource 流式播放                   |
| 19  | [LangGraph]        | [图形编排与多 Agent](./docs/chapters/19-langgraph-multi-agent.md)                                        | StateGraph → 条件路由 → HITL → Supervisor                  |
| 20  | [RAG·Agentic]      | [Agentic RAG 闭环](./docs/chapters/20-agentic-rag.md)                                                    | 查询路由→子问题拆解→多跳→联网兜底                          |
| 21  | [Deploy]           | [基于 Docker Compose 的本地开发环境和生产环境部署](./docs/chapters/21-docker-compose-deploy.md)          | 一键拉起开发 + 生产部署方案                                |
| 22  | [Retrieval]        | [ElasticSearch 全文检索：倒排索引 + IK 分词器 + BM25 算法](./docs/chapters/22-elasticsearch-fulltext.md) | 倒排索引+IK分词器+BM25算法                                 |
| 23  | [RAG·Hybrid]       | 混合检索 RAG：多路召回 + 重排模型                                                                        | ES + Milvus 双路 → 去重 → Rerank → 生成                    |
| 24  | [Rerank]           | DashScope Rerank 重排模型                                                                                | 阿里云重排 API 封装 + LangChain 集成                       |
| 25  | [Observability]    | [LangSmith 全链路观测：从 Agent 调试到 RAG 量化评估](./docs/chapters/25-langsmith-observability.md)      | Tracing 零侵入 + OpenEvals 三维度 RAG 评测                 |
| 26  | [DeepAgents]       | [开箱即用的 Skill、上下文压缩等 Middleware](./docs/chapters/26-deepagents-middleware.md)                 | Skills/Memory/Summarization/SubAgent/Filesystem Middleware |
| 27  | [DeepAgents·实战]  | [DeepAgents 实战：多 Agent 架构的深度调研助手](./docs/chapters/27-deep-research-assistant.md)            | createDeepAgent + 多子 Agent 协作 + Tavily 联网搜索        |
| 28  | [Database]         | [PostgreSQL：AI 时代最适合的数据库](./docs/chapters/28-postgresql-ai-database.md)                        | pgvector 向量检索 + 原生 SQL / TypeORM 双方案              |
| 29  | [Memory·Redis]     | [Redis：实现 Agent 短期记忆存储的最佳方案](./docs/chapters/29-redis-agent-memory.md)                     | ioredis + TTL 过期 + summarizationMiddleware 压缩          |
| 30  | [Memory·Mem0]      | [Mem0 记忆方案：从云端 API 到双层记忆架构](./docs/chapters/30-mem0-memory.md)                            | Cloud API + 自建 REST + Redis 双层记忆 + LLM 分类          |
| 31  | [NestJS·核心]      | [NestJS 请求生命周期：Pipe / Guard / Interceptor / 异常过滤器 / JWT](./docs/chapters/31-nest-core-features.md) | CRUD + Pipe + Guard + JWT + 统一响应                       |

## 推荐主线

第一次接触建议走这条路径，5 个章节覆盖核心能力：

```
[Agent] 01 → [RAG] 04 → [Memory] 09 → [NestJS·Agent] 15 → [RAG·Agentic] 20 → [RAG·Hybrid] 23 → [Observability] 25
```

## 核心模块速览

| 模块                                       | 章节                                | 说明                           |
| ------------------------------------------ | ----------------------------------- | ------------------------------ |
| `agent-react-todo.mjs`                     | [Agent] 01                          | ReAct 循环入口                 |
| `src/mcp-server.mjs`                       | [MCP] 02                            | MCP Server 实现                |
| `src/mcp-amap.mjs`                         | [MCP·Client] 03                     | 多 MCP Client                  |
| `src/mivlus/`                              | [RAG·Vector] 08                     | Milvus 向量库 CRUD + 电子书 RAG |
| `src/memory/`                              | [Memory] 09                         | 对话记忆管理                   |
| `src/output-parse/`                        | [StructuredOutput] 10               | 结构化输出                     |
| `src/prompt-template/`                     | [PromptTemplate] 12                 | 提示词组件化                   |
| `src/runnable/`                            | [Runnable] 13                       | Chain 组装                     |
| `src/asr-and-tts-nest-service/`            | [NestJS·SSE] 14                     | SSE 流式                       |
| `src/cron-job-tool/`                       | [NestJS·Agent] 15, [NestJS·Cron] 16 | Tool Calling + 定时任务        |
| `src/agui-backend/` + `src/agui-frontend/` | [AGUI·全栈] 17                      | AGUI 全栈                      |
| `src/tts-stt-nest/`                        | [语音·TTS/ASR] 18                   | 语音助手                       |
| `src/langgraph/`                           | [LangGraph] 19                      | 图形编排                       |
| `src/advanced-rag/`                        | [RAG·Agentic] 20                    | Agentic RAG                    |
| `src/elastic-search/`                      | [Retrieval] 22                      | ElasticSearch 全文检索         |
| `src/elastic-search/src/rag/`              | [RAG·Hybrid] 23                     | 混合检索 RAG                   |
| `src/elastic-search/src/rerank/`           | [Rerank] 24                         | DashScope 重排模型             |
| `src/smith-langchian/`                     | [Observability] 25                  | LangSmith 全链路观测           |
| `src/deep-agents/`                         | [DeepAgents] 26                     | Middleware 可插拔体系          |
| `src/deep-research-assistant/`             | [DeepAgents·实战] 27                | 多 Agent 深度调研助手          |
| `src/pgsql-test/`                          | [Database] 28                       | PostgreSQL + pgvector 向量检索 |
| `src/typeorm-pg-crud/`                     | [Database] 28                       | TypeORM + NestJS CRUD API      |
| `src/redis-test/`                          | [Memory·Redis] 29                   | Redis Agent 短期记忆           |
| `src/mem0-test/`                           | [Memory·Mem0] 30                    | Mem0 长期记忆 + 双层架构       |
| `src/nest-feature/`                        | [NestJS·核心] 31                    | NestJS 请求生命周期 + JWT      |

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
| [Docker Compose 部署](./docs/chapters/21-docker-compose-deploy.md) | 本地开发 + 生产环境一键部署  |
