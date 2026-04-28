# 🗺️ 推荐学习顺序

> 本文档为不同主题提供推荐的学习路径。每条路径都按"由浅入深"的顺序组织，跟着读完即可建立完整知识体系。

---

## 📑 目录

- [🚀 快速入门](#-快速入门)
- [💬 对话记忆管理学习路径](#-对话记忆管理学习路径)
- [📦 结构化大模型输出学习路径](#-结构化大模型输出学习路径)
- [🧩 PromptTemplate 组件化管理学习路径](#-prompttemplate-组件化管理学习路径)
- [🌊 Nest + LangChain 流式 AI 接口学习路径](#-nest-langchain-流式-ai-接口学习路径)
- [🔁 Nest + Tool Calling AI 智能助手学习路径](#-nest-tool-calling-ai-智能助手学习路径)
- [🤖 智能录入与 Mini Cursor Agent 学习路径](#-智能录入与-mini-cursor-agent-学习路径)

---

## 🚀 快速入门

如果你是第一次接触这类项目，建议按这个顺序看：

1. 先看 `src/mcp-server.mjs`，理解 MCP Server 最小结构
2. 再看 `src/tools/`，理解本地工具是怎么封装的
3. 然后看 `src/tool-runner.mjs`，理解工具调用循环
4. 最后看 `src/index.mjs` 和 `src/agent-react-todo.mjs`，理解 Agent 如何接任务并驱动整个流程

---

## 💬 对话记忆管理学习路径

如果是第一次学习记忆管理，建议按这个顺序：

### 基础存储（3 个文件）

1. **内存存储**：`src/memory/history-test.mjs` - 理解 `InMemoryChatMessageHistory`
2. **文件持久化**：`src/memory/history-test2.mjs` - 学习 `FileSystemChatMessageHistory`
3. **历史恢复**：`src/memory/history-test3.mjs` - 理解会话恢复机制

### 截断策略（1 个文件）

4. **消息截断**：`src/memory/truncation-memory.mjs` - 掌握按消息数/token 数截断

### 总结策略（2 个文件）

5. **消息数总结**：`src/memory/summarization-memory.mjs` - 学习基于消息数量的总结
6. **Token 级总结**：`src/memory/summarization-memory2.mjs` - 理解更精确的 token 级别管理

### 检索策略 - RAG（4 个文件，需先启动 Milvus）

7. **常量定义**：`src/memory/constant.mjs` - 了解集合名称配置
8. **数据插入**：`src/memory/insert-conversations.mjs` - 批量导入对话到向量数据库
9. **RAG 流程**：`src/memory/retrieval-memory.mjs` - 完整的检索-增强-生成-入库闭环
10. **数据查询**：`src/memory/query-conversations.mjs` - 查看向量数据库中的所有记录

📖 对应章节：[第 8 章 对话记忆管理](./chapters/08-conversation-memory.md)

---

## 📦 结构化大模型输出学习路径

如果是第一次学习结构化输出，建议按这个顺序：

### 基础解析（2 个文件）

1. **手动解析**：`src/output-parse/normal.mjs` - 理解 `JSON.parse()` 基础原理
2. **智能提取**：`src/output-parse/json-output-parser.mjs` - 学习 `JsonOutputParser`

### 结构化定义（3 个文件）

3. **字段定义**：`src/output-parse/structured-output-parser.mjs` - 理解 `StructuredOutputParser`
4. **Zod Schema**：`src/output-parse/zod-schema-parser.mjs` - 掌握完整类型系统
5. **现代 API**：`src/output-parse/with-structured-output.mjs` - 学习生产级最佳实践

### 流式输出（4 个文件）

6. **普通流式**：`src/output-parse/stream-normal.mjs` - 理解流式调用基础
7. **流式 + 结构化**：`src/output-parse/stream-structured-partial.mjs` - 学习两阶段处理
8. **Tool Calls 原始**：`src/output-parse/stream-tool-calls-raw.mjs` - 了解工具调用机制
9. **Tool Calls 解析**：`src/output-parse/stream-tool-calls-parser.mjs` - 掌握智能解析

### XML 格式（1 个文件）

10. **XML 解析**：`src/output-parse/xml-output-parser.mjs` - 了解 XML 格式处理

📖 对应章节：[第 9 章 结构化大模型输出](./chapters/09-structured-output.md)

---

## 🧩 PromptTemplate 组件化管理学习路径

如果是第一次学习提示词组件化，建议按这个顺序：

### 基础模板（1 个文件）

1. **基础用法**：`src/prompt-template/prompt-template1.mjs` - 理解 `PromptTemplate` 和占位符替换

### 管道模板（3 个文件）

2. **模块化组合**：`src/prompt-template/pipeline-prompt-template.mjs` - 学习 `PipelinePromptTemplate` 组合多个模块
3. **模块复用**：`src/prompt-template/pipeline-prompt-template2.mjs` - 理解导入复用其他文件的模块
4. **对话组合**：`src/prompt-template/pipeline-prompt-template3.mjs` - 掌握 Pipeline + `ChatPromptTemplate` 组合

### 部分应用（1 个文件）

5. **预填充变量**：`src/prompt-template/partial.mjs` - 学习 `.partial()` 创建可复用模板

### 对话模板（2 个文件）

6. **多角色对话**：`src/prompt-template/chat-prompt-template.mjs` - 理解 `ChatPromptTemplate` 和消息格式
7. **多轮对话**：`src/prompt-template/chat-prompt-template2.mjs` - 学习多轮对话历史管理

### 少样本模板（4 个文件）

8. **字符串示例**：`src/prompt-template/fewshot-prompt-template.mjs` - 理解 `FewShotPromptTemplate` 基础
9. **对话示例**：`src/prompt-template/fewshot-chat-prompt-template.mjs` - 学习 `FewShotChatMessagePromptTemplate`
10. **动态选择**：`src/prompt-template/example-selector1.mjs` - 掌握动态示例选择
11. **语义检索**：`src/prompt-template/example-selector2.mjs` - 理解基于相似度的示例选择

### 向量数据库（2 个文件，需先启动 Milvus）

12. **写入示例**：`src/prompt-template/weekly-report-examples-writer-milvus.mjs` - 学习向量存储
13. **检索示例**：`src/prompt-template/weekly-report-examples-reader-milvus.mjs` - 掌握语义检索

📖 对应章节：[第 11 章 PromptTemplate 组件化管理](./chapters/11-prompt-template.md)

---

## 🌊 Nest + LangChain 流式 AI 接口学习路径

如果是第一次学习 NestJS + LangChain 集成，建议按这个顺序：

### 环境准备（1 步）

1. **安装依赖**：进入 `src/asr-and-tts-nest-service/` 执行 `pnpm install`

### 后端核心（3 个文件，按数据流顺序阅读）

2. **Chain 构建**：`src/asr-and-tts-nest-service/src/ai/ai.service.ts` - 理解 LangChain Chain 的组装和流式输出
3. **SSE 端点**：`src/asr-and-tts-nest-service/src/ai/ai.controller.ts` - 学习 `@Sse()` 装饰器和 Observable 转换
4. **依赖注入**：`src/asr-and-tts-nest-service/src/ai/ai.module.ts` - 理解 NestJS 工厂提供者模式

### 配置与基础设施（2 个文件）

5. **环境变量**：`src/asr-and-tts-nest-service/src/utils/config.util.ts` - 学习 .env 自动查找策略
6. **根模块**：`src/asr-and-tts-nest-service/src/app.module.ts` - 理解模块编排和静态资源托管

### 前端交互（1 个文件）

7. **测试页面**：`src/asr-and-tts-nest-service/public/index.html` - 掌握 EventSource API 的使用

📖 对应章节：[第 13 章 Nest + LangChain 实现基于 SSE 的流式 AI 接口](./chapters/13-nest-langchain-sse.md)

---

## 🔁 Nest + Tool Calling AI 智能助手学习路径

如果是第一次学习 ReAct 循环和工具调用，建议按这个顺序：

### 环境准备（1 步）

1. **安装依赖**：进入 `src/cron-job-tool/` 执行 `pnpm install`

### 数据层（1 个文件）

2. **用户服务**：`src/cron-job-tool/src/ai/user.service.ts` - 理解 Map 内存数据库和 CRUD

### 工具注册（1 个文件，核心）

3. **模块与工具**：`src/cron-job-tool/src/ai/ai.module.ts` - 学习三个 LangChain 工具的工厂定义、Zod 参数校验、`MailerService` 注入

### ReAct 循环（1 个文件，核心）

4. **非流式版本**：`src/cron-job-tool/src/ai/ai.service.ts` 的 `runChain()` - 理解 `while(true)` 自循环逻辑
5. **流式版本**：`src/cron-job-tool/src/ai/ai.service.ts` 的 `runChainStream()` - 学习 `tool_call_chunks` 检测

### 控制器（1 个文件）

6. **API 端点**：`src/cron-job-tool/src/ai/ai.controller.ts` - 理解普通响应和 SSE 两个端点的分工

### 根模块（1 个文件）

7. **应用配置**：`src/cron-job-tool/src/app.module.ts` - 理解 `MailerModule` 异步配置

📖 对应章节：[第 14 章 Nest + Tool Calling 实现 AI 智能助手](./chapters/14-nest-tool-calling.md)

---

## 🤖 智能录入与 Mini Cursor Agent 学习路径

如果是第一次学习实战应用，建议按这个顺序（**3 个文件，需先启动 MySQL**）：

### 环境准备

1. **启动 MySQL**：使用 Docker Compose 启动数据库服务
2. **配置环境变量**：在 `.env` 中配置数据库连接信息
3. **初始化数据库**：`src/output-parse-demo/create-table.mjs` - 建表并插入测试数据

### 智能数据录入

4. **AI 文本提取**：`src/output-parse-demo/smart-import.mjs` - 学习非结构化文本到结构化数据的完整流程
5. **理解 Schema**：回顾 `src/output-parse/zod-schema-parser.mjs` - 理解 Zod Schema 的定义方式
6. **批量插入**：观察 `smart-import.mjs` 中的批量插入语法和事务处理

### Mini Cursor Agent

7. **Agent 循环**：`src/output-parse-demo/mini-cursor.mjs` - 理解 ReAct 模式的完整实现
8. **流式处理**：重点学习流式工具调用解析和增量 diff 显示算法
9. **消息历史**：理解 `InMemoryChatMessageHistory` 的作用和多轮对话管理
10. **工具绑定**：对比 `bindTools()` 和第 9 章的工具调用机制

### 工程化配置

11. **配置提取**：`src/output-parse-demo/constant.mjs` - 学习配置解耦的最佳实践
12. **Docker 编排**：`src/output-parse-demo/docker-compose-mysql.yml` - 理解容器化部署

📖 对应章节：[第 10 章 智能录入与 Mini Cursor Agent](./chapters/10-smart-import-mini-cursor.md)

---

## ➡️ 下一步

- 📚 回到 [章节目录](./../README.md#-章节目录)
- ✏️ 查看 [建议动手练习](./exercises.md)
