# [NestJS·SSE] Nest + LangChain 流式 AI 接口

> NestJS 集成 LangChain，通过 SSE 协议实现流式对话接口，后端逐字输出 → 前端打字机实时渲染。
> **关键词**：NestJS、SSE、@Sse()、AsyncGenerator、EventSource、流式输出

## 核心设计

这个 demo 解决了"如何把 LangChain 的流式输出通过 HTTP 稳定送前端"的问题。技术链路：

- **后端**：`AiService` 用 LangChain Chain 的 `.stream()` 返回 AsyncGenerator → `AiController` 用 `@Sse()` 装饰器 + RxJS Observable 包装 → 逐块推送 SSE
- **前端**：EventSource API 连接 SSE 端点，每收到一块数据就追加到页面，实现打字机效果
- **配置**：`ConfigModule` 从项目目录向上自动查找 `.env`，模型通过 ChatOpenAI 工厂提供者注入

SSE 相比 WebSocket 的优势：单向推送够用、HTTP 透传无障碍、无需额外心跳维护。

## 运行方式

```bash
cd src/asr-and-tts-nest-service
pnpm install
pnpm start:dev
```

浏览器打开 `http://localhost:3000`，在输入框填写问题，点击发送即可看到流式打字机效果。也可以用 curl 直接测 SSE 端点：

```bash
curl -N "http://localhost:3000/ai/chat/stream?query=什么是NestJS"
```

## 扩展方向

- 给 SSE 端点增加多事件类型（message/done/error），前端按类型分发渲染
- 将 LangChain Chain 替换为带 Tool Calling 的 ReAct Agent，观察流式 + 工具调用的混合表现
- 增加心跳机制，空闲时发 `:keep-alive` 防止反向代理断连

---
⬅️ [声明式 Chain](./12-runnable-chain.md) ｜ [📚 目录](../../README.md#目录) ｜ [Nest Tool Calling ➡️](./14-nest-tool-calling.md)