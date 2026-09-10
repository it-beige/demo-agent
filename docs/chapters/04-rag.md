# [RAG] 检索增强生成：网页加载→切分→向量检索→引用溯源

> 两个 demo 拼出 RAG 全貌：`loader-and-spliter2.mjs` 跑通「网页加载→切分→检索→回答」并做双重降级，`rag-demo.mjs` 用手写语料聚焦最小闭环，并让回答用 `【片段N】` 标注来源。
> **关键词**：RAG、Cheerio、文本切分、Embeddings、降级兜底、引用溯源

## 核心设计

RAG 的本质就是"把检索结果拼进 Prompt"，复杂度集中在两头：**怎么把对的资料检索出来**，以及**怎么让模型老实用这些资料**。本章两个 demo 各管一头。

| 文件                      | 语料来源                        | 检索后端                       | 侧重点             |
| ------------------------- | ------------------------------- | ------------------------------ | ------------------ |
| `loader-and-spliter2.mjs` | 掘金文章（Cheerio → Puppeteer） | MemoryVectorStore → 关键词兜底 | 管线打通与降级     |
| `rag-demo.mjs`            | 手写 7 段故事 `Document`        | MemoryVectorStore              | 最小闭环与引用溯源 |

### 模块一：loader-and-spliter2 — 全链路与双重降级

- **加载器降级**：先用 `CheerioWebBaseLoader` 解析静态 HTML，抓到的内容为空时主动抛错进入 catch，改用 Puppeteer 真实渲染页面再取 `.main-area p`
- **文本切分**：`RecursiveCharacterTextSplitter` 以 `。！？` 为分隔符，`chunkSize: 500` / `chunkOverlap: 50`——重叠保证关键句不会恰好落在 chunk 边界上被切断
- **检索后端降级**：`createRetrievalBackend()` 先用 `embedQuery` 探活，Embeddings 不可用时返回一个同接口的关键词检索实现（整串命中 + bigram + 单字三级加权），保证管线在任何配置下都能跑通
- **检索工具化**：检索被封装成 `rag-retrieve` 工具交给 `runToolAgent`，由模型自己决定查什么、查几条（`k` 参数），而不是硬编码调用

### 模块二：rag-demo — 最小闭环与引用溯源

- **前置探活**：`ensureEmbeddingsReady()` 先逐项校验 `EMBEDDING_*` 四个变量，再发一次最小 `embedQuery`，失败时把当前 baseURL、model 和该检查的变量名一起抛出。这里**刻意不降级**——demo 的目的就是把配置问题暴露在第一秒
- **检索与打分**：`asRetriever({ k })` 取 Top-3 片段，另用 `similaritySearchWithScore` 拿到余弦相似度（越大越相似）一并打印
- **引用标注**：`context` 每段头部写成 `[片段N]（第X章）`，Prompt 用四条硬性要求约束模型在句末标 `【片段N】`，编号上界由 `retrievedDocs.length` 注入，与 `RETRIEVE_TOP_K` 自动保持一致
- **溯源校验**：`collectCitations()` 用 `matchAll(/【片段(\d+)】/g)` 扫描回答，去重排序得到实际引用的编号，越界编号单独收进 `invalid`
- **两个可观测信号**：`未被引用的片段` 说明 Top-K 偏大、检索进了噪音；`⚠️ 不存在的片段编号` 说明模型出现了编号幻觉

回答与溯源的实际输出：

```
【AI 回答】
东东和光光从幼儿园的时候就认识啦……【片段1】。光光教东东运动，东东教光光画画……【片段2】。

【引用溯源】
片段1 -> 第2章 | 角色=东东 | 类型=角色介绍
片段2 -> 第6章 | 角色=光光和东东 | 类型=结局
未被引用的片段: 片段3
```

## 运行方式

先在 `.env` 配好 `API_KEY`/`BASE_URL`/`MODEL` 与 `EMBEDDING_API_KEY`/`EMBEDDING_BASE_URL`/`EMBEDDING_MODEL`/`EMBEDDING_DIM`（embeddings 走独立配置，聊天网关通常不提供 `/embeddings`）：

```bash
# 网页 RAG 全链路（Embeddings 不可用会自动降级为关键词检索）
pnpm dev src/demo/loader-and-spliter2.mjs

# 最小 RAG 闭环 + 引用溯源（缺 EMBEDDING_* 直接报错）
pnpm dev src/demo/rag-demo.mjs
```

观察重点：检索片段的相似度是否合理；回答里的 `【片段N】` 与「引用溯源」列出的章节能否对上；问一个语料里没有的问题时，模型是否老实说"这个故事里还没有提到这个细节"而不是编造。

## 踩坑提醒

- **同一个问题被向量化两次**：`retriever.invoke()` 和 `similaritySearchWithScore()` 各算一次 query embedding，多一次请求和费用。只为打印分数时可合并为一次 `similaritySearchWithScore`，再 `map(([doc]) => doc)` 取文档
- **用 `pageContent` 做匹配键不可靠**：两个结果集靠正文全等配对，语料中出现重复段落时会取到错误分数，稳妥做法是在 `metadata` 里放唯一 id
- **`baseURL` 必须写进 `configuration`**：写成顶层参数不报错但静默失效，请求会打到官方域名直至超时
- **相似度语义因库而异**：`MemoryVectorStore` 返回余弦相似度（越大越像），换成返回「距离」的向量库时排序会整个反过来

## 扩展方向

- 调整 `chunkSize`/`chunkOverlap` 与 Top-K，用「未被引用的片段」当噪音指标反向调参
- 将 MemoryVectorStore 替换为 Milvus/PGVector 等持久化向量库，避免每次运行重新向量化
- 让 `metadata`（章节/角色/类型）参与检索过滤或加权，做成 metadata filtering
- 把 `【片段N】` 渲染为可点击的引用链接，实现回答与原文对照展示

---

⬅️ [多 MCP Server](./03-multi-mcp.md) ｜ [📚 目录](../../README.md#目录) ｜ [Puppeteer 动态抓取 ➡️](./05-dynamic-content.md)
