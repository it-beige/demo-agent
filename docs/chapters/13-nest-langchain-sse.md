# 第 13 章：Nest + LangChain 实现基于 SSE 的流式 AI 接口

> NestJS 集成 LangChain，通过 SSE 协议实现流式 AI 对话接口。核心问题：**如何将 LangChain 的流式能力通过 HTTP 协议稳定地传递到前端。**

---

## 📖 章节简介

- **文件**：`src/asr-and-tts-nest-service/` 目录下的完整 NestJS 项目
- **内容**：NestJS 集成 LangChain，通过 SSE 协议实现流式 AI 对话接口
  - **后端架构**：NestJS 模块化设计、LangChain Chain 流式输出、RxJS Observable 转换
  - **SSE 端点**：`@Sse()` 装饰器声明、AsyncGenerator 流式生成、EventSource 协议规范
  - **前端交互**：EventSource API 消费 SSE、实时状态指示、连接生命周期管理
  - **配置管理**：`ConfigModule` 环境变量注入、`.env` 自动向上查找策略
  - **静态托管**：`ServeStaticModule` 托管前端测试页面
- **重点**：后端流式输出到前端实时渲染的完整链路、NestJS 与 LangChain 的集成模式、SSE 协议的工程化实践
- **核心问题**：如何将 LangChain 的流式能力通过 HTTP 协议稳定地传递到前端

---

## 📁 涉及文件

### 核心文件（3 个文件）

- `src/asr-and-tts-nest-service/src/ai/ai.controller.ts`：SSE 控制器（`@Sse()` 装饰器 + RxJS Observable）
- `src/asr-and-tts-nest-service/src/ai/ai.service.ts`：LangChain Chain 构建 + AsyncGenerator 流式输出
- `src/asr-and-tts-nest-service/src/ai/ai.module.ts`：依赖注入 + ChatOpenAI 工厂提供者

### 配置与工具（2 个文件）

- `src/asr-and-tts-nest-service/src/utils/config.util.ts`：`.env` 文件自动向上查找策略
- `src/asr-and-tts-nest-service/src/app.module.ts`：应用根模块（`ConfigModule` + `ServeStaticModule` + `AiModule`）

### 前端页面（1 个文件）

- `src/asr-and-tts-nest-service/public/index.html`：SSE 测试页面（EventSource API + 状态指示 + 实时渲染）

---

## 🚀 如何运行

> ⚠️ **前置条件**：需要先在根目录 `.env` 中配置 `MODEL`、`API_KEY`、`BASE_URL`

### 1️⃣ 安装依赖

```bash
cd src/asr-and-tts-nest-service
pnpm install
```

---

### 2️⃣ 启动开发服务器

```bash
pnpm start:dev
```

这个示例会：

- 启动 NestJS 服务（默认监听 3000 端口）
- 自动向上查找 `.env` 文件加载环境变量
- 注册 SSE 流式聊天端点 `GET /ai/chat/stream?query=xxx`
- 托管静态前端测试页面到根路径

---

### 3️⃣ 打开测试页面

浏览器访问 `http://localhost:3000`，页面提供：

- 输入框填写问题内容
- 点击「开始流式请求」建立 SSE 连接
- 实时显示 AI 响应内容（打字机效果）
- 连接状态指示（连接中 / 已连接 / 已断开）
- 支持手动停止请求

---

### 4️⃣ 直接测试 SSE 端点

也可以用 curl 测试：

```bash
curl -N "http://localhost:3000/ai/chat/stream?query=什么是NestJS"
```

---

## 🗺️ 推荐学习顺序

详见 [推荐学习顺序 - Nest + LangChain 流式 AI 接口学习路径](./../learning-path.md#-nest-langchain-流式-ai-接口学习路径)。

---

## ✏️ 动手练习

详见 [建议动手练习 - Nest + LangChain 流式 AI 接口练习](./../exercises.md#-nest-langchain-流式-ai-接口练习)。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 12 章 Runnable 链式组装](./12-runnable-chain.md) | [章节目录](./../../README.md#-章节目录) | [第 14 章 Nest + Tool Calling 实现 AI 智能助手](./14-nest-tool-calling.md) |
