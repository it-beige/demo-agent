# 进阶方向

> 每章核心能力延伸，适合在 demo 基础上做深度探索。

## [MCP] 进阶

- 在 `src/mcp-server.mjs` 新增一个 `list_users` 工具，返回所有用户 ID 和姓名
- 新增一个资源 `docs://users`，说明当前有哪些用户数据可用
- 把内存数据库拆到单独文件，感受模块拆分后的工具组织方式
- 对比 `src/tool-runner.mjs`，思考 Agent 的 `while(true)` 循环和 MCP 的 stdio 通信有什么本质差异

## [Memory] 进阶

- 修改 `summarization-memory2.mjs`，让生成的摘要也添加回历史记录（目前只计算未保存）
- 给 `truncation-memory.mjs` 增加 `SystemMessage` 始终不被截断的逻辑
- 调整 `retrieval-memory.mjs` 的 k 值，对比 k=1/3/5 的回答质量
- 给检索增加过滤条件（如只检索最近 3 轮的对话）

## [RAG·Pipeline] Milvus 向量库进阶

- 修改 `insert.mjs`，为日记增加地理位置字段，支持基于地点的过滤检索
- 尝试不同索引类型（IVF_SQ8、HNSW），对比检索性能和准确率
- 实现日记的更新和删除操作

## [RAG] 电子书 RAG 进阶

- 修改 `ebook-writer.mjs`，支持 PDF 格式电子书（PDFLoader）
- 在 `ebook-reader-rag.mjs` 中增加引用来源标注（回答时标出第几章）
- 给问答系统增加对话历史，支持多轮追问
- 实现混合检索：向量检索 + 关键词检索（章节号、角色名精确匹配）

## [Agent·实战] 智能录入与 Mini Cursor Agent 进阶

- 在 `friendSchema` 中添加新字段（邮箱、地址、头像 URL），观察 AI 的提取能力
- 添加新工具 `search-file`（在目录中搜索文件）
- 实现任务超时机制：超过 5 分钟自动终止
- 将 `.env` 配置改为支持多个数据库环境（开发、测试、生产）

## [PromptTemplate] 进阶

- 修改 `prompt-template1.mjs`，创建一个新的周报模板占位符
- 在 `pipeline-prompt-template.mjs` 中添加第 5 个模块（风险评估）
- 在 `fewshot-prompt-template.mjs` 中添加更多示例，实现动态示例选择
- 修改 `weekly-report-examples-writer-milvus.mjs`，添加 10 条新示例并调整检索参数

## [NestJS·SSE] 流式 AI 接口进阶

- 给 SSE 响应添加 `event` 字段，实现多种事件类型（message/done/error）
- 在 `ai.service.ts` 中添加带对话历史的 Chain（RunnableWithMessageHistory）
- 实现多模型切换：通过 Query 参数选择不同模型
- 添加流式输出的进度显示（已接收字符数、耗时统计）

## [NestJS·Agent] Tool Calling 进阶

- 添加 `weather_search` 工具：通过天气 API 查询指定城市天气
- 实现并行工具调用：用 `Promise.all` 同时执行不依赖的工具
- 给工具添加超时机制：调用外部 API 超 5 秒自动超时
- 将 if/else 调度改为注册表模式，新增工具无需改调度代码

## [StructuredOutput] 结构化输出进阶

- 对比 `normal.mjs` 和 `json-output-parser.mjs`，观察 AI 返回格式的稳定性差异
- 在 `zod-schema-parser.mjs` 中定义一个新的复杂 schema（如电影信息）
- 在 `stream-tool-calls-raw.mjs` 中添加多工具调用支持
- 对比 `bindTools` 和 `withStructuredOutput` 的底层实现差异

## [语音·TTS/ASR] 语音助手进阶

- 修改 `speech.service.ts`，支持更多音频格式（mp3、ogg、webm）
- 给 `tts-relay.service.ts` 添加会话超时机制：5 分钟无活动自动关闭
- 实现 WebSocket 连接认证（JWT token 验证）
- 添加音频播放进度条和音量控制

## [LangGraph] 多 Agent 架构进阶

- 在 `basic-graph.mjs` 的 Annotation.Root 中加数组字段 `logs`，每节点 push 日志
- 在 `conditional-routing.mjs` 中新增第三种分支（translate）
- 把 `MemorySaver` 换成基于文件的 checkpointer（序列化到 JSON）
- 改造 `graph-interrupt.mjs`，把单步确认变成多步确认
- 在 Supervisor 基础上新增第三个子代理 `news_agent`，观察调度策略变化

## [Observability] LangSmith 全链路观测进阶

- 在 `.env` 中开启 `LANGCHAIN_SMITH_TRACING_V2=true`，跑一次 `cli.mjs` 并在 LangSmith UI 查看 Run 树结构
- 在 `evaluators.mjs` 中新增第 4 个指标：答案简洁性（Answer Conciseness）
- 修改 `build_dataset.mjs`，添加 5 条新 QA 样例，跑一次实验对比分数变化
- 改造 `run_eval.mjs`，支持同时跑两个实验（不同 `experimentPrefix`），在 LangSmith UI 横向对比结果

## ➡️ 下一步

- 📚 回到 [目录](./../README.md#目录)
- 🗺️ 查看 [推荐学习顺序](./learning-path.md)
