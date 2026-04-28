# 第 4 章：RAG 检索增强生成

> 完整的 RAG 链路：网页加载 → 文本切分 → 向量索引 → 检索回答。

---

## 📖 章节简介

- **文件**：`src/demo/loader-and-spliter2.mjs`, `src/demo/rag-demo.mjs`
- **内容**：网页加载 → 文本切分 → 向量索引 → 检索回答
- **重点**：`chunkSize`/`chunkOverlap`、embeddings 降级兜底

---

## 📁 涉及文件

### RAG 示例

- `src/demo/loader-and-spliter2.mjs`：网页加载 + 文本切分 + RAG 完整流程
- `src/demo/rag-demo.mjs`：Embedding 配置与健康检查

---

## 🚀 如何运行

### 前置条件

如果你要运行向量检索功能，需要在 `.env` 中提供：

```bash
EMBEDDINGS_BASE_URL=https://your-embeddings-endpoint
EMBEDDINGS_API_KEY=your-embeddings-key
EMBEDDINGS_MODEL=text-embedding-3-small
```

> 💡 如果不提供 `EMBEDDINGS_*`，当前示例会优先回退到 `API_KEY / BASE_URL`，再不行就自动降级为关键词检索。详见 [快速开始 - 向量检索](./../getting-started.md#向量检索可选)。

### 完整 RAG 流程

```bash
node src/loader-and-spliter2.mjs
```

这个示例会：

1. 抓取一篇网页文章
2. 切分文本
3. 尝试建立向量检索
4. embeddings 不可用时自动切换为关键词检索
5. 最后基于检索到的片段回答问题

### 仅测试 embeddings 配置

如果你只想测试 embeddings 配置是否可用，也可以看 `src/rag-demo.mjs`。

---

## ✏️ 动手练习

更多 RAG 相关练习参见 [练习 - 电子书 RAG 系统练习](./../exercises.md#-电子书-rag-系统练习)。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 3 章 多 MCP Server 集成](./03-multi-mcp.md) | [章节目录](./../../README.md#-章节目录) | [第 5 章 动态网站内容提取](./05-dynamic-content.md) |
