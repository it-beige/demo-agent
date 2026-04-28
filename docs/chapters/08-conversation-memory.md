# 第 8 章：对话记忆管理

> 三大记忆管理策略（截断、总结、检索）的完整演示。核心问题：**如何在对话历史过长时智能管理记忆，避免超出模型上下文窗口。**

---

## 📖 章节简介

- **文件**：`src/memory/` 目录下的示例代码
- **内容**：三大记忆管理策略（截断、总结、检索）
  - **基础存储**：`InMemoryChatMessageHistory`、`FileSystemChatMessageHistory`
  - **截断策略**：按消息数量截断、按 token 数量截断（`trimMessages` API）
  - **总结策略**：基于消息数量的总结、基于 token 数量的精确总结
  - **检索策略**：Milvus 向量数据库存储、语义检索、RAG 完整流程
- **重点**：记忆存储策略对比、token 级别的消息管理、向量检索实现、RAG 数据流
- **核心问题**：如何在对话历史过长时智能管理记忆，避免超出模型上下文窗口

---

## 📁 涉及文件

### 基础存储

- `src/memory/history-test.mjs`：`InMemoryChatMessageHistory` 基础用法（内存存储）
- `src/memory/history-test2.mjs`：`FileSystemChatMessageHistory` 持久化存储（写入文件）
- `src/memory/history-test3.mjs`：从文件恢复历史对话（读取已保存的会话）
- `src/memory/chat_history.json`：`FileSystemChatMessageHistory` 的存储文件示例

### 截断策略

- `src/memory/truncation-memory.mjs`：消息截断策略（按消息数、按 token 数）

### 总结策略

- `src/memory/summarization-memory.mjs`：基于消息数量的对话总结策略
- `src/memory/summarization-memory2.mjs`：基于 token 数量的对话总结策略（更精确）

### 检索策略（RAG）

- `src/memory/constant.mjs`：集合名称常量定义
- `src/memory/insert-conversations.mjs`：批量插入对话数据到 Milvus 向量数据库
- `src/memory/retrieval-memory.mjs`：完整的 RAG 检索增强生成流程演示
- `src/memory/query-conversations.mjs`：查询 Milvus 中的所有对话记录

---

## 🚀 如何运行

### 1️⃣ 测试内存存储（`InMemoryChatMessageHistory`）

```bash
node src/memory/history-test.mjs
```

这个示例会：

- 在内存中创建对话历史
- 演示两轮对话的完整流程
- 展示所有历史消息的保存情况
- 适合理解 LangChain 消息管理的基础概念

---

### 2️⃣ 测试文件持久化（`FileSystemChatMessageHistory`）

```bash
node src/memory/history-test2.mjs
```

这个示例会：

- 将对话历史保存到 `src/memory/chat_history.json`
- 演示多轮对话的持久化存储
- 可以在运行后查看 JSON 文件了解存储格式

---

### 3️⃣ 测试历史恢复

```bash
node src/memory/history-test3.mjs
```

这个示例会：

- 从 `chat_history.json` 文件加载之前的对话
- 展示恢复后的历史消息
- 继续在恢复的对话基础上进行新对话

---

### 4️⃣ 测试消息截断策略

```bash
node src/memory/truncation-memory.mjs
```

这个示例会：

- 演示按消息数量截断（保留最近 N 条消息）
- 演示按 token 数量截断（使用 `trimMessages` API）
- 使用 `js-tiktoken` 精确计算 token 数

---

### 5️⃣ 测试基于消息数量的总结

```bash
node src/memory/summarization-memory.mjs
```

这个示例会：

- 当消息数量超过阈值时触发总结
- 保留最近的 2 条消息
- 调用 AI 模型总结旧对话的核心内容

---

### 6️⃣ 测试基于 token 数量的总结（更精确）

```bash
node src/memory/summarization-memory2.mjs
```

这个示例会：

- 使用 `cl100k_base` 编码器计算 token 数
- 当总 token 数超过 200 时触发总结
- 保留最近约 80 个 token 的消息（约占 40%）
- 逆向遍历算法：从最新消息开始保留，确保上下文连贯

---

### 7️⃣ 测试检索策略 - 数据准备（Milvus 向量数据库）

> ⚠️ **前置条件**：需要先启动 Milvus 服务

```bash
node src/memory/insert-conversations.mjs
```

这个示例会：

- 连接到本地 Milvus 向量数据库（`localhost:19530`）
- 创建 `conversations` 集合（包含 id、vector、content、round、timestamp 字段）
- 创建 `IVF_FLAT` 索引，使用 COSINE 相似度度量
- 批量插入 5 条测试对话数据
- 使用 Embeddings 模型将对话文本转换为 1024 维向量

---

### 8️⃣ 测试检索策略 - RAG 完整流程

```bash
node src/memory/retrieval-memory.mjs
```

这个示例会：

- 演示完整的 RAG（检索增强生成）流程
- 针对 3 个测试问题，依次执行：
  1. **检索**：将问题向量化，从 Milvus 检索最相似的 2 条历史对话
  2. **增强**：将检索到的历史对话作为上下文构建 prompt
  3. **生成**：调用 AI 模型生成回答
  4. **入库**：将新对话向量化后存入 Milvus，形成闭环
- 显示每条检索结果的相似度分数（score）

---

### 9️⃣ 测试检索策略 - 查询所有记录

```bash
node src/memory/query-conversations.mjs
```

这个示例会：

- 查询 Milvus 集合中的所有对话记录
- 显示每条记录的完整信息（ID、轮次、时间、内容）
- 适合验证数据插入和检索结果

---

## 🗺️ 推荐学习顺序

详见 [推荐学习顺序 - 对话记忆管理学习路径](./../learning-path.md#-对话记忆管理学习路径)。

---

## ✏️ 动手练习

详见 [建议动手练习 - 对话记忆管理练习](./../exercises.md#-对话记忆管理练习) 和 [Milvus 向量数据库练习](./../exercises.md#-milvus-向量数据库练习)。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 7 章 文本分割器详解](./07-text-splitter.md) | [章节目录](./../../README.md#-章节目录) | [第 9 章 结构化大模型输出](./09-structured-output.md) |
