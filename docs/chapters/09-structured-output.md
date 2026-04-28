# 第 9 章：结构化大模型输出

> 从基础到高级的结构化输出解析技术。核心问题：**如何稳定可靠地让 AI 返回符合预期的结构化数据。**

---

## 📖 章节简介

- **文件**：`src/output-parse/` 目录下的示例代码
- **内容**：从基础到高级的结构化输出解析技术
  - **基础解析**：手动 `JSON.parse()`、`JsonOutputParser` 智能提取
  - **结构化定义**：`StructuredOutputParser` 字段定义、Zod Schema 完整类型系统
  - **现代 API**：`withStructuredOutput()` 最简封装、一行搞定结构化输出
  - **流式输出**：普通文本流式、结构化数据流式、增量 diff 显示算法
  - **Tool Calls**：原生函数调用、流式工具调用、`JsonOutputToolsParser` 解析
  - **XML 格式**：`XMLOutputParser` XML 格式输出解析
- **重点**：输出解析器家族对比、流式与结构化组合、Tool Calls 原生能力、生产级最佳实践
- **核心问题**：如何稳定可靠地让 AI 返回符合预期的结构化数据

---

## 📁 涉及文件

### 基础解析（2 个文件）

- `src/output-parse/normal.mjs`：手动 `JSON.parse()` 基础演示
- `src/output-parse/json-output-parser.mjs`：`JsonOutputParser` 智能提取与格式指令

### 结构化定义（3 个文件）

- `src/output-parse/structured-output-parser.mjs`：`StructuredOutputParser` 字段定义
- `src/output-parse/zod-schema-parser.mjs`：Zod Schema 完整类型系统（嵌套对象、数组、可选字段）
- `src/output-parse/with-structured-output.mjs`：现代 API 一行搞定结构化输出

### 流式输出（4 个文件）

- `src/output-parse/stream-normal.mjs`：普通文本流式输出演示
- `src/output-parse/stream-structured-partial.mjs`：流式接收 + 批量解析（两阶段处理）
- `src/output-parse/stream-tool-calls-raw.mjs`：流式 Tool Calls 原始数据
- `src/output-parse/stream-tool-calls-parser.mjs`：流式 Tool Calls + `JsonOutputToolsParser` 智能解析

### XML 格式（1 个文件）

- `src/output-parse/xml-output-parser.mjs`：XML 格式输出解析

---

## 🚀 如何运行

### 1️⃣ 基础解析

```bash
node src/output-parse/normal.mjs
```

这个示例会：

- 演示最基础的模型调用和 JSON 解析
- 使用 `JSON.parse()` 手动解析 AI 返回的 JSON 字符串
- 适合理解结构化输出的基础原理

---

### 2️⃣ JsonOutputParser 智能提取

```bash
node src/output-parse/json-output-parser.mjs
```

这个示例会：

- 使用 `JsonOutputParser` 自动提取和解析 JSON
- 通过 `getFormatInstructions()` 自动生成格式指令
- 比手动解析更鲁棒，能处理 AI 的额外文字

---

### 3️⃣ StructuredOutputParser 字段定义

```bash
node src/output-parse/structured-output-parser.mjs
```

这个示例会：

- 使用 `fromNamesAndDescriptions()` 定义字段名和描述
- 生成包含字段说明的详细格式指令
- 保证字段完整性（所有字段必填）

---

### 4️⃣ Zod Schema 完整类型系统

```bash
node src/output-parse/zod-schema-parser.mjs
```

这个示例会：

- 使用 Zod 定义复杂嵌套结构（对象、数组、可选字段）
- 演示完整的类型系统（string、number、array、object）
- 自动类型校验，失败时抛出 `ZodError`

---

### 5️⃣ withStructuredOutput 现代 API

```bash
node src/output-parse/with-structured-output.mjs
```

这个示例会：

- 使用 `model.withStructuredOutput(schema)` 一行搞定结构化输出
- 自动完成格式指令注入、解析、验证
- 生产环境推荐的最佳实践

---

### 6️⃣ 普通文本流式输出

```bash
node src/output-parse/stream-normal.mjs
```

这个示例会：

- 演示 `model.stream()` 的流式调用
- 使用 `for await...of` 遍历异步数据流
- 实现打字机效果实时显示

---

### 7️⃣ 流式 + 结构化（两阶段处理）

```bash
node src/output-parse/stream-structured-partial.mjs
```

这个示例会：

- 流式接收 AI 返回的 JSON 字符串
- 累积完整内容后批量解析
- 展示两阶段处理模式

---

### 8️⃣ 流式 Tool Calls 原始数据

```bash
node src/output-parse/stream-tool-calls-raw.mjs
```

这个示例会：

- 使用 `bindTools()` 绑定工具定义
- 流式接收 `tool_call_chunks` 原始数据
- 直接打印 JSON 参数片段

---

### 9️⃣ 流式 Tool Calls 智能解析

```bash
node src/output-parse/stream-tool-calls-parser.mjs
```

这个示例会：

- 使用 `JsonOutputToolsParser` 自动解析工具调用
- 通过 `.pipe()` 连接模型和解析器
- 演示增量 diff 显示算法

---

### 🔟 XML 格式输出

```bash
node src/output-parse/xml-output-parser.mjs
```

这个示例会：

- 使用 `XMLOutputParser` 处理 XML 格式输出
- 生成 XML 格式指令
- 解析 XML 为 JavaScript 对象

---

## 🗺️ 推荐学习顺序

详见 [推荐学习顺序 - 结构化大模型输出学习路径](./../learning-path.md#-结构化大模型输出学习路径)。

---

## ✏️ 动手练习

详见 [建议动手练习 - 结构化大模型输出练习](./../exercises.md#-结构化大模型输出练习)。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 8 章 对话记忆管理](./08-conversation-memory.md) | [章节目录](./../../README.md#-章节目录) | [第 10 章 智能录入与 Mini Cursor Agent](./10-smart-import-mini-cursor.md) |
