# [StructuredOutput] 结构化大模型输出：从 JSON.parse 到 withStructuredOutput

> 对比 5 种结构化输出方案，从手动解析到现代 API，找到生产级最佳实践。
> **关键词**：Zod、withStructuredOutput、流式解析、Tool Calls、结构化 Schema

## 核心设计

让模型返回自由文本容易，让它稳定返回可解析的结构化数据才是工程难点。这个 demo 按演进路线展示了 5 种方案：

1. **手动 `JSON.parse()`**：最原始，模型多输了一个标点就会炸
2. **`JsonOutputParser`**：自动提取 JSON 并生成格式指令，比手动更鲁棒
3. **`StructuredOutputParser` + Zod**：声明式定义字段类型，失败时抛 `ZodError` 带详细错误信息
4. **`withStructuredOutput()`**（推荐）：一行搞定格式注入、解析、验证，当前生产最佳实践
5. **Tool Calls**：利用模型原生的 function calling 能力，通过 `bindTools` 绑定工具定义，模型自行决定何时调用

同时还覆盖了流式 + 结构化的混合场景：流式接收 token → 累积完整 JSON → 批量解析，以及 `JsonOutputToolsParser` 做流式 Tool Calls 的增量 diff 显示。

## 运行方式

```bash
# 基础解析
pnpm dev src/output-parse/normal.mjs
pnpm dev src/output-parse/json-output-parser.mjs

# 结构化定义
pnpm dev src/output-parse/structured-output-parser.mjs
pnpm dev src/output-parse/zod-schema-parser.mjs
pnpm dev src/output-parse/with-structured-output.mjs

# 流式
pnpm dev src/output-parse/stream-normal.mjs
pnpm dev src/output-parse/stream-structured-partial.mjs

# Tool Calls
pnpm dev src/output-parse/stream-tool-calls-raw.mjs
pnpm dev src/output-parse/stream-tool-calls-parser.mjs

# XML
pnpm dev src/output-parse/xml-output-parser.mjs
```

## 扩展方向

- 将 `withStructuredOutput` + Zod 集成到 NestJS 接口中，实现类型安全的 AI 响应
- 对比 `bindTools` 和 `withStructuredOutput` 在不同场景下的准确率和延迟
- 实现流式 + 结构化 + Tool Calls 三者组合的复杂场景

---
⬅️ [对话记忆管理](./08-conversation-memory.md) ｜ [📚 目录](../../README.md#目录) ｜ [智能录入 + Mini Cursor ➡️](./10-smart-import-mini-cursor.md)