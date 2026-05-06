# [AGUI·全栈] Vercel AI SDK + LangChain 流式组件渲染

> 基于 AGUI 协议实现类似 ChatGPT 的工具调用面板：用户能看到 AI 生成参数的过程、搜索结果的精美展示、邮件发送的实时进度。
> **关键词**：AGUI、UIMessage、useChat、ToolPanel、@ai-sdk/langchain、全栈

## 核心设计

这个 demo 是前后端全栈项目，核心价值在于 **AGUI 协议的 UIMessage 数据流**：

- **后端**：NestJS + LangChain `createAgent` 构建 Agent → `@ai-sdk/langchain` 的 `toUIMessageStream` 桥接到 Vercel AI SDK → `pipeUIMessageStreamToResponse` 推流
- **协议**：`UIMessage` 包含 text、tool-invocation、data 等多种 part 类型，工具调用有 `tool-input-available`（参数流式生成）、`tool-output-available`（结果返回）、`tool-output-error`（错误处理）三个阶段
- **前端**：`@ai-sdk/react` 的 `useChat` Hook + `DefaultChatTransport` 消费 UIMessage → 自定义 ToolPanel 组件渲染 WebSearch 面板（综合答案 + 引用列表）和 SendMail 面板（参数流式生成 + 进度显示）

与第 14 章对比：第 14 章是后端 Tool Calling，前端无感知；这一章把工具调用的全过程可视化地呈现给用户。

## 扩展方向

- 新增更多 ToolPanel 类型（图表渲染、地图展示、代码 diff 对比）
- 将 AGUI 协议替换为自定义 SSE 方案，对比开发体验差异
- 实现工具调用面板的历史回溯（查看之前的工具调用结果）

---
⬅️ [AI 定时任务](./15-nest-cron-job.md) ｜ [📚 目录](../../README.md#目录) ｜ [实时语音助手 ➡️](./17-nest-tts-asr.md)