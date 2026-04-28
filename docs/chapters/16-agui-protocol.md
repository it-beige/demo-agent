# 第 16 章：AGUI 协议：Vercel AI SDK + LangChain 实现流式组件渲染

> 基于 Vercel AI SDK 的 AGUI 协议，实现 AI 对话中的流式组件渲染。核心问题：**如何实现类似 ChatGPT 的流式工具调用面板——用户能看到 AI 生成参数的过程、搜索结果的精美展示、邮件发送的实时进度。**

---

## 📖 章节简介

- **文件**：`src/agui-backend/` + `src/agui-frontend/` 完整全栈项目
- **内容**：基于 Vercel AI SDK 的 AGUI 协议，实现 AI 对话中的流式组件渲染（工具调用面板、搜索面板、邮件面板等）
  - **后端架构**：NestJS + LangChain `createAgent` + `@ai-sdk/langchain` 桥接层 + `pipeUIMessageStreamToResponse`
  - **AGUI 协议**：`UIMessage` 格式定义（包含 text、tool-invocation、data 等多种 part 类型）、流式传输规范
  - **前端实现**：`@ai-sdk/react` 的 `useChat` Hook + `DefaultChatTransport` + 自定义 ToolPanel 组件
  - **组件渲染**：WebSearch 搜索结果面板（综合答案 + 引用列表）、SendMail 邮件面板（参数流式生成 + 进度显示）、Markdown 流式渲染
  - **流式处理**：`tool-input-available`（参数流式生成）、`tool-output-available`（结果返回）、`tool-output-error`（错误处理）
- **重点**：AGUI 协议的 `UIMessage` 数据流、LangChain Agent 到 Vercel AI SDK 的桥接模式、流式工具调用组件、前后端协议对齐
- **核心问题**：如何实现类似 ChatGPT 的流式工具调用面板——用户能看到 AI 生成参数的过程、搜索结果的精美展示、邮件发送的实时进度

---

## 📁 涉及文件

### 后端核心（3 个文件）

- `src/agui-backend/src/ai/ai.controller.ts`：AI 控制器（POST /ai/chat 端点 + `pipeUIMessageStreamToResponse`）
- `src/agui-backend/src/ai/ai.service.ts`：AI 服务（LangChain `createAgent` + `toUIMessageStream` 桥接）
- `src/agui-backend/src/ai/ai.module.ts`：AI 模块（ChatOpenAI + WebSearch Tool + SendMail Tool 工厂提供者）

### 前端核心（3 个文件）

- `src/agui-frontend/src/App.tsx`：主应用（`useChat` Hook + `DefaultChatTransport` + 对话界面）
- `src/agui-frontend/src/components/ToolPanels.tsx`：工具面板组件（WebSearch / SendMail 面板 + 流式状态处理）
- `src/agui-frontend/src/components/StreamdownText.tsx`：Markdown 流式渲染组件

---

## 🚀 如何运行

> 💡 源 README 未为本章单独提供运行说明。本章涉及前后端两个独立子项目，需分别 `cd` 进去 `pnpm install` 后启动：
>
> ```bash
> # 后端
> cd src/agui-backend
> pnpm install
> pnpm start:dev
>
> # 前端（另开一个终端）
> cd src/agui-frontend
> pnpm install
> pnpm dev
> ```
>
> 启动后即可在前端页面中体验流式工具调用面板效果。

---

## ✏️ 动手练习

> 💡 源 README 未为本章单独列出动手练习。可以结合第 9 章流式 Tool Calls、第 14 章 Tool Calling 的练习举一反三。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 15 章 Nest + Tool 实现 OpenClaw 同款定时任务](./15-nest-cron-job.md) | [章节目录](./../../README.md#-章节目录) | — |
