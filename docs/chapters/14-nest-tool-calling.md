# 第 14 章：Nest + Tool Calling 实现 AI 智能助手（ReAct 循环）

> NestJS 集成 LangChain，实现带工具调用的 AI 智能助手。核心问题：**如何让 AI 在对话中自主调用外部工具完成复杂任务。**

---

## 📖 章节简介

- **文件**：`src/cron-job-tool/` 目录下的完整 NestJS 项目
- **内容**：NestJS 集成 LangChain，实现带工具调用的 AI 智能助手
  - **ReAct 循环**：`while(true)` 循环让 AI 自主决策——推理 → 调用工具 → 观察结果 → 继续推理
  - **工具定义**：LangChain `tool()` 包装 + Zod 参数校验的工厂提供者模式
  - **查询用户**：`query_user` 工具 + `UserService` 内存数据库（三国人物数据）
  - **发送邮件**：`send_mail` 工具 + `@nestjs-modules/mailer` SMTP 集成
  - **互联网搜索**：`web_search` 工具 + Bocha Web Search API 实时搜索
  - **流式输出**：工具调用场景下的流式处理（`tool_call_chunks` 检测）
- **重点**：ReAct 循环的完整实现、多工具注册与调度、流式 + 工具调用的混合处理、工厂提供者依赖注入
- **核心问题**：如何让 AI 在对话中自主调用外部工具完成复杂任务

---

## 📁 涉及文件

### 核心文件（4 个文件）

- `src/cron-job-tool/src/ai/ai.controller.ts`：AI 控制器（普通响应 + SSE 流式两个端点）
- `src/cron-job-tool/src/ai/ai.service.ts`：ReAct 循环核心（工具调度 + 流式混合输出）
- `src/cron-job-tool/src/ai/ai.module.ts`：工厂提供者（ChatOpenAI + 三个工具定义）
- `src/cron-job-tool/src/ai/user.service.ts`：用户数据服务（Map 内存数据库 + CRUD）

### 配置与工具（2 个文件）

- `src/cron-job-tool/src/utils/config.util.ts`：`.env` 文件自动向上查找策略
- `src/cron-job-tool/src/app.module.ts`：应用根模块（`ConfigModule` + `MailerModule` + `AiModule`）

---

## 🚀 如何运行

> ⚠️ **前置条件**：需要先在根目录 `.env` 中配置 `MODEL`、`API_KEY`、`BASE_URL`

### 1️⃣ 安装依赖

```bash
cd src/cron-job-tool
pnpm install
```

> ⚠️ **注意**：发送邮件功能需要额外安装 `@nestjs-modules/mailer`：
>
> ```bash
> pnpm add @nestjs-modules/mailer
> ```
>
> 并在 `.env` 中配置 `MAIL_HOST`、`MAIL_PORT`、`MAIL_USER`、`MAIL_PASS`、`MAIL_FROM`。详见 [快速开始 - 邮件发送](./../getting-started.md#邮件发送可选)。

---

### 2️⃣ 启动开发服务器

```bash
pnpm start:dev
```

---

### 3️⃣ 测试普通问答

```bash
curl "http://localhost:3000/ai/chat?query=什么是NestJS"
```

这个示例会：

- 启动 NestJS 服务（默认监听 3000 端口）
- 注册普通聊天端点 `GET /ai/chat?query=xxx`（一次性返回 JSON）
- 注册流式聊天端点 `GET /ai/chat/stream?query=xxx`（SSE 实时推送）
- AI 可根据问题自主选择调用工具

---

### 4️⃣ 测试工具调用 — 查询用户

```bash
curl "http://localhost:3000/ai/chat?query=查询用户001的信息"
```

这个示例会：

- AI 识别需要调用 `query_user` 工具
- 查询内存数据库中三国人物的信息（赵云、诸葛亮、关羽等）
- 返回格式化后的用户信息

---

### 5️⃣ 测试工具调用 — 互联网搜索

> ⚠️ **前置条件**：需要在 `.env` 中配置 `BOCHA_API_KEY`（Bocha Web Search API Key）

```bash
curl "http://localhost:3000/ai/chat?query=帮我搜索一下今天的人工智能新闻"
```

这个示例会：

- AI 识别需要调用 `web_search` 工具
- 调用 Bocha API 搜索互联网
- 返回结构化的搜索结果（标题、URL、摘要、来源）

---

### 6️⃣ 测试流式工具调用

```bash
curl -N "http://localhost:3000/ai/chat/stream?query=查询用户003的信息"
```

这个示例会：

- 以 SSE 流式方式输出 AI 回答
- 如果 AI 决定调用工具，流式输出会暂停，执行工具后继续输出
- 最终用户看到的是连续的流式回答体验

---

## 🗺️ 推荐学习顺序

详见 [推荐学习顺序 - Nest + Tool Calling AI 智能助手学习路径](./../learning-path.md#-nest-tool-calling-ai-智能助手学习路径)。

---

## ✏️ 动手练习

详见 [建议动手练习 - Nest + Tool Calling AI 智能助手练习](./../exercises.md#-nest-tool-calling-ai-智能助手练习)。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 13 章 Nest + LangChain 流式 SSE 接口](./13-nest-langchain-sse.md) | [章节目录](./../../README.md#-章节目录) | [第 15 章 Nest + Tool 实现 OpenClaw 同款定时任务](./15-nest-cron-job.md) |
