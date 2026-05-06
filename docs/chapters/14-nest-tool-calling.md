# [NestJS·Agent] Nest + Tool Calling：ReAct 循环 AI 智能助手

> NestJS 集成 LangChain ReAct 循环，模型自主调用查询用户、发送邮件、联网搜索三个工具完成任务。
> **关键词**：ReAct、Tool Calling、bindTools、工厂提供者、流式工具调用、SMTP

## 核心设计

这个 demo 在 NestJS 中实现了完整的 ReAct Agent 闭环。核心决策：

- **ReAct 循环**：`while(true)` 自循环——模型推理需要什么信息 → 调用对应工具 → 观察结果 → 继续推理直到能回答
- **工具注册**：三个工具通过 LangChain `tool()` + Zod 参数校验在 `AiModule` 中定义为工厂提供者，NestJS DI 自动注入依赖（如 `MailerService`）
- **工具池**：`query_user`（内存 Map 存储三国人物）、`send_mail`（NestJS Mailer SMTP）、`web_search`（Bocha Web Search API）
- **流式混合**：流式输出中检测 `tool_call_chunks`，工具执行时暂停流式、执行完后继续输出

流式端点和非流式端点各一个（`/ai/chat` 和 `/ai/chat/stream`），前端可按需选择。

## 运行方式

```bash
cd src/cron-job-tool
pnpm install
pnpm start:dev
```

测试不同工具调用场景：

```bash
# 普通问答（不需工具）
curl "http://localhost:3000/ai/chat?query=什么是NestJS"

# 查询用户
curl "http://localhost:3000/ai/chat?query=查询用户001的信息"

# 联网搜索（需配 BOCHA_API_KEY）
curl "http://localhost:3000/ai/chat?query=搜索今天的人工智能新闻"

# 流式工具调用
curl -N "http://localhost:3000/ai/chat/stream?query=查询用户003的信息"
```

邮件功能需额外配置 `MAIL_HOST`、`MAIL_USER` 等 SMTP 环境变量。

## 扩展方向

- 将 `while(true)` 循环改造为 LangGraph StateGraph 实现，获得可视化流程图和检查点
- 给工具增加超时控制，防止外部 API 卡死整个 Agent 循环
- 实现并行工具调用：模型可同时调多个不依赖的工具

---
⬅️ [Nest SSE 流式](./13-nest-langchain-sse.md) ｜ [📚 目录](../../README.md#目录) ｜ [AI 定时任务 ➡️](./15-nest-cron-job.md)