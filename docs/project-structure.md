# 项目结构

> 核心模块与对应章节的快速索引。每个模块的详细说明见对应章节文档。

## 核心模块

| 模块                                       | 对应章节                            | 说明                            |
| ------------------------------------------ | ----------------------------------- | ------------------------------- |
| `src/agent-react-todo.mjs`                 | [Agent] 01                          | Agent ReAct 循环 + 本地工具调用 |
| `src/mcp-server.mjs`                       | [MCP] 02                            | MCP Server 最小实现             |
| `src/mcp-amap.mjs`                         | [MCP·Client] 03                     | 多 MCP Server 客户端接入        |
| `src/demo/`                                | [RAG·Pipeline] 04-06                | 网页加载、文本切分、向量索引    |
| `src/splitters/`                           | [RAG·Pipeline] 07                   | 多策略文本切分                  |
| `src/memory/`                              | [Memory] 08                         | 对话记忆：截断、总结、检索      |
| `src/output-parse/`                        | [StructuredOutput] 09               | 结构化输出：JSON→Zod→流式       |
| `src/output-parse-demo/`                   | [Agent·实战] 10                     | 智能录入 + Mini Cursor Agent    |
| `src/prompt-template/`                     | [PromptTemplate] 11                 | 提示词组件化                    |
| `src/runnable/`                            | [Runnable] 12                       | 声明式 Chain 组装               |
| `src/asr-and-tts-nest-service/`            | [NestJS·SSE] 13                     | Nest + LangChain SSE 流式       |
| `src/cron-job-tool/`                       | [NestJS·Agent] 14, [NestJS·Cron] 15 | Tool Calling + 定时任务         |
| `src/agui-backend/` + `src/agui-frontend/` | [AGUI·全栈] 16                      | AGUI 流式组件渲染               |
| `src/tts-stt-nest/`                        | [语音·TTS/ASR] 17                   | 腾讯云实时语音助手              |
| `src/langgraph/`                           | [LangGraph] 18                      | StateGraph 编排 + 多 Agent      |
| `src/advanced-rag/`                        | [RAG·Agentic] 19                    | Agentic RAG 闭环                |
| `src/neo4j-graphrag/`                      | [GraphRAG] 20                       | Neo4j 知识图谱 + Graph RAG      |
| `src/elastic-search/`                      | [Retrieval] 21                      | ElasticSearch 全文检索          |
| `src/smith-langchian/`                     | [Observability] 24                  | LangSmith 链路追踪 + RAG 评测   |
| `src/deep-agents/`                         | [DeepAgents] 25                     | Middleware 可插拔体系           |
| `src/deep-research-assistant/`             | [DeepAgents·实战] 26                | 多 Agent 深度调研助手           |
| `src/pgsql-test/`                          | [Database] 27                       | PostgreSQL + pgvector 原生 SQL  |
| `src/typeorm-pg-crud/`                     | [Database] 27                       | TypeORM + NestJS CRUD API       |
| `src/redis-test/`                          | [Memory·Redis] 28                   | Redis Agent 短期记忆 + TTL 过期 |
| `src/mem0-test/`                           | [Memory·Mem0] 29                    | Mem0 长期记忆 + 双层架构        |

## 工具模块

| 模块                  | 说明                                                           |
| --------------------- | -------------------------------------------------------------- |
| `src/tools/`          | 本地工具实现（file-read/write/directory-list/command-execute） |
| `src/tool-runner.mjs` | 工具调用循环                                                   |
| `react-todo-app/`     | Agent 生成的 React Todo 产物                                   |

---

## ➡️ 下一步

- 📚 回到 [目录](./../README.md#目录) 按章节学习
- 🗺️ 查看 [推荐学习顺序](./learning-path.md)
