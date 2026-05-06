# [Memory] 对话记忆管理：截断、总结、检索三大策略

> 演示三种管理超长对话记忆的核心策略，解决模型上下文窗口有限的问题。
> **关键词**：记忆截断、对话总结、向量检索、Milvus、Token 管理

## 核心设计

当对话轮次增多，历史消息很快超出模型的上下文窗口。这个 demo 提供了三种策略的完整实现和对比：

**截断策略**：最简单的思路——保留最近 N 条消息或最近 N 个 token，采用逆向遍历算法从最新消息开始保留以确保上下文连贯。使用 `trimMessages` API + `js-tiktoken` 精确计算 token。

**总结策略**：当消息数或 token 数超过阈值时，调用模型将旧对话压缩为摘要，注入下一轮 prompt。关键是"保留最近 + 总结旧"的平衡——保留太多 token 浪费窗口，保留太少丢失上下文。

**检索策略**（最完整）：将对话向量化存入 Milvus，每轮新问题时先检索最相关的历史对话，拼接为上下文后再生成回答，形成"检索 → 增强 → 生成 → 入库"的闭环。

此外还演示了基础的存储方式：`InMemoryChatMessageHistory`（内存）、`FileSystemChatMessageHistory`（文件持久化）。

## 运行方式

```bash
# 基础存储
pnpm dev src/memory/history-test.mjs          # 内存存储
pnpm dev src/memory/history-test2.mjs         # 文件持久化

# 截断策略
pnpm dev src/memory/truncation-memory.mjs

# 总结策略
pnpm dev src/memory/summarization-memory.mjs   # 按消息数总结
pnpm dev src/memory/summarization-memory2.mjs  # 按 token 数总结

# 检索策略（需先启动 Milvus）
pnpm dev src/memory/insert-conversations.mjs   # 插入测试数据
pnpm dev src/memory/retrieval-memory.mjs       # RAG 完整流程
pnpm dev src/memory/query-conversations.mjs    # 查询所有记录
```

## 扩展方向

- 实现分级总结：旧消息总结多次，每次越来越精简
- 将三种策略组合使用（截断兜底 + 总结压缩 + 检索召回）
- 替换 Milvus 为 Redis/Pinecone 等其他向量存储方案

---
⬅️ [文本分割器](./07-text-splitter.md) ｜ [📚 目录](../../README.md#目录) ｜ [结构化输出 ➡️](./09-structured-output.md)