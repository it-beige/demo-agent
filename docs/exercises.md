# ✏️ 建议动手练习

> 如果你想把仓库内容真正学进去，可以直接做下面这些小练习。所有练习都按章节主题分类，难度循序渐进。

---

## 📑 目录

- [🔌 MCP 相关练习](#-mcp-相关练习)
- [💬 对话记忆管理练习](#-对话记忆管理练习)
- [🧮 Milvus 向量数据库练习](#-milvus-向量数据库练习)
- [📚 电子书 RAG 系统练习](#-电子书-rag-系统练习)
- [🤖 智能录入与 Mini Cursor Agent 练习](#-智能录入与-mini-cursor-agent-练习)
- [🧩 PromptTemplate 组件化管理练习](#-prompttemplate-组件化管理练习)
- [🌊 Nest + LangChain 流式 AI 接口练习](#-nest-langchain-流式-ai-接口练习)
- [🔁 Nest + Tool Calling AI 智能助手练习](#-nest-tool-calling-ai-智能助手练习)
- [📦 结构化大模型输出练习](#-结构化大模型输出练习)

---

## 🔌 MCP 相关练习

1. 在 `src/mcp-server.mjs` 里新增一个 `list_users` 工具，返回所有用户 ID 和姓名
2. 给 `query_user` 增加更多字段，比如部门、手机号或创建时间
3. 新增一个资源，比如 `docs://users`，专门说明当前有哪些用户数据
4. 把内存数据库拆到单独文件里，感受代码组织方式的变化
5. 对照 `src/tool-runner.mjs`，思考 Agent 的工具调用循环和 MCP 的调用方式有什么本质差异

---

## 💬 对话记忆管理练习

### 基础存储与截断

1. 修改 `summarization-memory2.mjs`，将生成的摘要也添加回历史记录（目前只计算但未保存）
2. 实现分级总结策略：旧消息总结多次，每次越来越精简
3. 给 `truncation-memory.mjs` 增加系统提示词保留功能（`SystemMessage` 始终不被截断）
4. 实现一个混合策略：优先按 token 数，但最少保留 N 条消息
5. 尝试使用 `ConversationSummaryMemory`（LangChain 内置）对比自定义实现
6. 给 `FileSystemChatMessageHistory` 增加多会话管理（不同 sessionId 的切换）

### 检索策略 - RAG

7. 修改 `insert-conversations.mjs`，批量插入 100 条对话数据，观察性能变化
8. 调整 `retrieval-memory.mjs` 中的 k 值（检索数量），对比 k=1、k=3、k=5 的回答质量
9. 给检索增加过滤条件，如只检索最近 3 轮的对话（`filter: 'round >= 3'`）
10. 实现动态 k 值：根据问题类型自动调整检索数量
11. 添加检索结果的缓存层（Redis），避免重复查询相同问题
12. 对比不同相似度度量方式（COSINE vs L2 vs IP）的检索效果差异

---

## 🧮 Milvus 向量数据库练习

### 基础操作

13. 修改 `insert.mjs`，为 AI 日记增加地理位置字段（location），支持基于地点的过滤检索
14. 尝试不同的索引类型（IVF_SQ8、HNSW），对比检索性能和准确率差异
15. 实现日记的更新和删除操作，理解 Milvus 的数据管理
16. 给 `insert.mjs` 增加批量导入功能，从 JSON 文件读取 100 条日记数据

---

## 📚 电子书 RAG 系统练习

### 电子书处理

17. 修改 `ebook-writer.mjs`，支持 PDF 格式电子书（使用 `PDFLoader`）
18. 优化章节切分策略：尝试不同的 `chunkSize`（300、800、1000），对比检索效果
19. 为电子书增加段落级别的细粒度切分，实现更精准的引用定位
20. 实现多本书籍的并行导入，通过 `book_id` 区分不同书籍

### 检索与问答

21. 在 `ebook-reader-rag.mjs` 中增加引用来源标注（回答时标明出自第几章）
22. 实现跨章节检索：先定位相关章节，再在该章节内进行二次检索
23. 给问答系统增加对话历史，支持多轮追问（如"他还会什么？"）
24. 对比不同 Embeddings 模型的检索质量（尝试不同的 embedding 模型）
25. 实现混合检索：向量检索 + 关键词检索（章节号、角色名精确匹配）

> 💡 上面的 MCP / 对话记忆 / Milvus / 电子书 RAG 这几组练习都不大，但非常适合建立对 MCP 和 Agent 的直觉。

---

## 🤖 智能录入与 Mini Cursor Agent 练习

### 智能数据录入

1. 修改 `smart-import.mjs` 的测试文本，尝试提取 5 个人的信息并批量插入
2. 在 `friendSchema` 中添加新字段（如邮箱、地址、头像 URL），观察 AI 的提取能力
3. 实现错误重试机制：当 AI 提取失败时自动重试最多 3 次
4. 添加流式输出：使用 `model.stream()` 实时显示 AI 的提取过程
5. 实现数据验证：在插入前用 Zod Schema 验证 AI 返回的数据格式
6. 对比不同模型的提取准确率（qwen-max vs qwen-plus vs qwen-turbo）

### Mini Cursor Agent

7. 添加新工具：实现 `search-file` 工具（在目录中搜索文件）
8. 添加工具调用日志：记录每个工具的执行时间和结果
9. 实现最大循环警告：当接近 30 次循环时打印警告信息
10. 添加任务超时机制：超过 5 分钟自动终止任务
11. 实现工具调用并行化：让 AI 可以同时调用多个不依赖的工具
12. 添加任务进度显示：实时显示当前是第几轮循环、执行了什么工具

### 工程化配置

13. 将 `.env` 配置改为支持多个数据库环境（开发、测试、生产）
14. 在 `docker-compose-mysql.yml` 中添加数据卷备份策略
15. 实现数据库迁移脚本：支持表结构的版本管理
16. 添加健康检查：在脚本启动前自动检测 MySQL 服务是否可用
17. 实现数据库连接池：支持并发查询场景
18. 添加性能监控：记录每次数据库操作的耗时

---

## 🧩 PromptTemplate 组件化管理练习

### 基础模板

1. 修改 `prompt-template1.mjs`，创建一个新的周报模板，添加更多占位符
2. 实现模板缓存机制，避免重复创建相同的 `PromptTemplate`
3. 对比字符串拼接和 `PromptTemplate` 的优劣

### 管道模板

4. 在 `pipeline-prompt-template.mjs` 中添加第 5 个模块（如风险评估模块）
5. 创建日报模板，复用人设和背景模块（`personaPrompt`、`contextPrompt`）
6. 实现模板配置文件（JSON），动态加载模块定义
7. 对比单个大模板和管道模板的维护成本
8. 实现模板版本管理（v1/v2/v3 的平滑切换）

### 部分应用

9. 使用 `.partial()` 创建多公司模板工厂函数
10. 实现模板缓存：相同的 `.partial()` 调用返回相同实例
11. 对比 `.partial()` 和直接传入所有变量的性能差异
12. 实现动态 `.partial()`：从数据库加载预设配置

### 对话模板

13. 在 `chat-prompt-template.mjs` 中添加 assistant 消息（多轮对话）
14. 实现对话历史管理（`MessagesPlaceholder` 动态插入）
15. 对比 `PromptTemplate` 和 `ChatPromptTemplate` 的适用场景
16. 创建对话模板工厂函数，支持不同角色设定

### 少样本模板

17. 在 `fewshot-prompt-template.mjs` 中添加第 3 条示例
18. 实现动态示例：根据用户输入选择不同的示例集
19. 对比 `FewShotPromptTemplate` 和 `FewShotChatMessagePromptTemplate`
20. 实现示例质量评估：记录哪些示例最有效

### 向量检索

21. 修改 `weekly-report-examples-writer-milvus.mjs`，添加 10 条新示例
22. 调整检索参数（k 值、相似度阈值），对比检索效果
23. 实现混合检索：向量检索 + 关键词过滤
24. 添加示例更新机制：支持增删改 Milvus 中的示例

---

## 🌊 Nest + LangChain 流式 AI 接口练习

### SSE 端点

1. 修改 `ai.controller.ts`，添加 POST 方式的 SSE 端点（支持 Body 传参而非 Query）
2. 给 SSE 响应添加 `event` 字段，实现多种事件类型（如 `message`、`done`、`error`）
3. 实现心跳机制：空闲时每 15 秒发送 `:keep-alive` 注释行，防止连接超时
4. 添加连接数限制：当同时连接数超过阈值时拒绝新连接

### LangChain 集成

5. 在 `ai.service.ts` 中添加带对话历史的 Chain（结合 `RunnableWithMessageHistory`）
6. 实现多模型切换：通过 Query 参数选择不同模型（如 qwen-max / qwen-plus）
7. 添加 Tool Calls 支持：让 SSE 端点也能流式输出工具调用结果
8. 实现 Chain 的降级机制：主模型失败时自动切换到备选模型

### 前端交互

9. 在 `index.html` 中添加 Markdown 渲染（使用 marked.js）
10. 实现多轮对话界面：维护消息历史，支持连续提问
11. 添加流式输出的进度显示（已接收字符数、耗时统计）
12. 实现断线重连机制：SSE 连接意外断开时自动重试

### 工程化

13. 添加 Swagger 文档：为 SSE 端点生成 API 文档
14. 实现请求日志中间件：记录每次 SSE 请求的查询内容和响应耗时
15. 添加限流守卫（`ThrottlerGuard`）：防止 SSE 端点被滥用
16. 实现流式输出的单元测试：使用 Observable 测试工具验证 SSE 输出

---

## 🔁 Nest + Tool Calling AI 智能助手练习

### ReAct 循环

1. 添加最大循环轮次限制（`maxIterations`），防止 AI 陷入无限工具调用死循环
2. 实现并行工具调用：用 `Promise.all` 同时执行多个不依赖的工具
3. 添加工具调用日志记录，显示每轮 AI 调用了什么工具、传了什么参数、结果如何
4. 实现缓存机制：同一工具相同参数的结果在短时间内不再重复调用

### 工具扩展

5. 添加 `weather_search` 工具：通过天气 API 查询指定城市的天气信息
6. 添加 `calculator` 工具：让 AI 能够调用计算器处理数学运算
7. 添加 `get_time` 工具：返回当前时间，测试无参数的简单工具
8. 实现动态工具发现：将 if/else 调度改为注册表模式，新增工具无需改调度代码

### 流式输出

9. 优化流式输出中工具调用的用户体验：调用工具时显示「🔍 正在查询用户信息...」
10. 将工具返回结果也以流式方式推送，用户能看到 AI 的"思考过程"
11. 实现带权重的工具选择：AI 在多个工具之间时显示候选列表

### 邮件集成

12. 补充安装 `@nestjs-modules/mailer` 并配置 SMTP，测试发送邮件功能
13. 添加邮件发送模板：支持 HTML 格式的邮件排版
14. 实现邮件发送队列：批量发送时不阻塞 AI 响应

### 工程化

15. 给工具添加超时机制：调用外部 API（如 Bocha）超过 5 秒自动超时
16. 实现工具的健康检查端点：`GET /ai/tools/status` 返回所有工具的可用状态
17. 添加 AI 的多轮对话记忆：用 `RunnableWithMessageHistory` 支持上下文对话

---

## 📦 结构化大模型输出练习

### 基础解析

1. 对比 `normal.mjs` 和 `json-output-parser.mjs`，观察 AI 返回格式的稳定性差异
2. 故意让 AI 返回包含额外文字的 JSON，测试两种解析方式的容错能力
3. 修改 `json-output-parser.mjs` 的 schema，添加更多字段观察效果

### 结构化定义

4. 在 `zod-schema-parser.mjs` 中定义一个新的复杂 schema（如电影信息、商品信息）
5. 实现嵌套对象数组（如作者的多本书籍，每本书有多个章节）
6. 测试 `ZodError` 错误处理，观察 AI 返回不符合 schema 时的详细错误信息
7. 对比 `structured-output-parser.mjs` 和 `zod-schema-parser.mjs` 的格式指令差异

### 流式输出

8. 修改 `stream-normal.mjs`，添加进度条显示（如：已接收 X 字符）
9. 在 `stream-structured-partial.mjs` 中实现实时解析进度显示
10. 优化 `stream-tool-calls-parser.mjs` 的 diff 算法，支持格式化 JSON 显示
11. 实现流式输出的暂停/继续功能（模拟网络中断场景）

### Tool Calls

12. 在 `stream-tool-calls-raw.mjs` 中添加多工具调用支持
13. 实现 Tool Calls 结果的自动执行（如调用天气 API、搜索 API）
14. 对比 `bindTools` 和 `withStructuredOutput` 的底层实现差异
15. 实现 Tool Calls 的并行调用和结果聚合

### XML 格式

16. 修改 `xml-output-parser.mjs`，定义特定的 XML schema（如果支持）
17. 对比 XML 和 JSON 在同一任务中的 AI 遵循度
18. 实现 XML 结果的 XPath 查询和数据提取

---

## ➡️ 下一步

- 📚 回到 [章节目录](./../README.md#-章节目录)
- 🗺️ 查看 [推荐学习顺序](./learning-path.md)
