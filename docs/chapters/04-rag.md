# [RAG] 检索增强生成：网页加载→切分→向量检索→回答

> 完整 RAG 管线：抓取网页 → 文本切分 → 向量化索引 → 语义检索 → 基于检索结果生成回答。
> **关键词**：RAG、Cheerio、文本切分、Embeddings、降级兜底

## 核心设计

这个 demo 展示了 RAG 最经典的管线结构。关键设计点：

- **加载器兼容**：先用 Cheerio 解析静态 HTML，失败时自动回退到 Puppeteer 渲染动态页面
- **文本切分**：使用 `RecursiveCharacterTextSplitter` 按分隔符优先级递归切分，`chunkSize` 和 `chunkOverlap` 可调
- **Embeddings 降级**：优先使用独立配置的 Embeddings API（`EMBEDDINGS_*` 环境变量），不可用时回退到对话模型的 API，再不行就自动切换为关键词匹配——保证管线在任何配置下都能跑通
- **向量检索**：基于 MemoryVectorStore 做内存向量检索，Top-K 结果拼接为上下文注入 Prompt

## 扩展方向

- 调整 `chunkSize`/`chunkOverlap`，对比检索召回率和回答质量的变化
- 将 MemoryVectorStore 替换为 Milvus/Pinecone 等持久化向量库
- 增加引用溯源：回答中标注内容来自第几个 chunk

---
⬅️ [多 MCP Server](./03-multi-mcp.md) ｜ [📚 目录](../../README.md#目录) ｜ [Puppeteer 动态抓取 ➡️](./05-dynamic-content.md)