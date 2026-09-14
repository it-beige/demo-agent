# [RAG·Vector] Milvus 向量数据库：从 CRUD 到电子书 RAG

> 用 Milvus 把「向量存储」当成一等公民：先在 AI 日记场景跑通建集合 → 建索引 → 增删改查 → 检索增强问答的完整闭环，再进阶到《天龙八部》整本电子书的分章入库与 RAG 问答。
> **关键词**：Milvus、Collection、IVF_FLAT、COSINE、upsert、EPUB 断点续传、批处理 Embedding

## 核心设计

第 4 章的 RAG 用的是内存版 `MemoryVectorStore`，进程一退数据就没了；第 9 章的对话记忆检索也只是把 Milvus 当黑盒调用。这一章把 Milvus 本身讲透——它是一个**独立部署、持久化、支持亿级向量**的专用向量库，通过 `@zilliz/milvus2-sdk-node` 用类 SQL 的 API 操作。

理解 Milvus 先抓住五个概念：

- **Collection**：相当于「表」，由若干 **Field** 组成，必须有一个主键字段和一个 `FloatVector` 字段，其余是可过滤的标量字段（`VarChar`/`Int32`/`Array` 等）
- **Index**：向量字段上的索引，demo 用 `IVF_FLAT`（把向量空间聚成 `nlist` 个簇再检索），生产还有 `HNSW` 等
- **Metric**：相似度度量，demo 统一用 `COSINE`（余弦）——**插入与检索必须用同一种，否则分数无意义**
- **load**：集合必须先 `loadCollection` 加载进内存才能 `search`，这是最容易漏的一步
- **consistency_level**：`Strong` 保证能读到刚写入的数据，`list.mjs` 里用它来即时校验

整章分两条主线：`ai-diary/` 用 5 条日记讲清 CRUD + RAG 的**每个原子操作**；`book-test/` 用一整本 EPUB 小说讲清**大规模入库**要面对的分章、断点续传、批处理三大工程问题。

## 模块一：ai-diary — 日记的向量 CRUD + RAG

集合 `ai_diary` 字段：`id`(主键) + `vector`(FloatVector) + `content` + `date` + `mood` + `tags`(Array)。文本向量统一走 `src/shared/model.mjs` 导出的 `embeddings.embedQuery()`。

### 代码结构

| 脚本         | 职责          | 关键 API                                                             |
| ------------ | ------------- | -------------------------------------------------------------------- |
| `insert.mjs` | 建集合 + 建索引 + 加载 + 插入 5 条日记 | `createCollection` / `createIndex` / `loadCollection` / `insert` |
| `query.mjs`  | 语义检索最相似的 2 条 | `search`（`metric_type: COSINE`, `limit`）                     |
| `list.mjs`   | 刷盘统计 + 标量过滤 + 按主键批量取 | `flush` / `getCollectionStatistics` / `query`（`filter` + `Strong`） |
| `update.mjs` | 更新一条日记  | `upsert`（**改内容必须重算 vector**）                                |
| `delete.mjs` | 单条 / 批量 / 条件删除 | `delete`（`filter: id == / id in [...] / mood == "sad"`）      |
| `rag.mjs`    | 检索增强问答  | `search` 取 Top-K → 拼上下文 → `model.invoke`                        |

- **索引参数**：`insert.mjs` 用 `nlist: 1024`，这对只有 5 条数据的教学集合是反面示范——实践经验值约 `4 * sqrt(行数)`，数据量小时 `nlist` 过大反而拖慢建索引
- **load 的坑**：只有 `insert.mjs` 调了 `loadCollection`，`query.mjs`/`rag.mjs` 依赖集合已处于加载态；单独重启 Milvus 后直接跑检索会失败，需先加载
- **upsert 不是字段级更新**：`update.mjs` 改了 `content` 后重新 `getEmbedding` 生成新 `vector` 一起写回，否则会产生「文本变了、向量还是旧的」的语义脏数据
- **RAG 闭环**：`rag.mjs` 检索 Top-K 日记 → 拼成带日期/心情/标签的上下文 → 用温暖语气的 prompt 交给 LLM，是第 4 章 RAG 在持久化向量库上的落地版

## 模块二：book-test — 《天龙八部》电子书 RAG

集合 `ebook`（名字取自 `EBOOK_COLLECTION_NAME`）字段：`id` + `book_id` + `book_name` + `chapter_num`(Int32) + `index`(Int32) + `content` + `vector`。

### 代码结构

| 脚本                    | 职责                                                                   |
| ----------------------- | ---------------------------------------------------------------------- |
| `ebook-writer.mjs`      | `EPubLoader`(splitChapters) → 每章再用 `RecursiveCharacterTextSplitter` 切成 500 字片段 → 逐章向量化入库，支持**断点续传** |
| `ebook-query.mjs`       | 纯向量检索，打印命中片段的章节号与相似度                               |
| `ebook-reader-rag.mjs`  | 检索 Top-5 片段 → RAG 问答（如「鸠摩智会什么武功？」）                  |
| `ebook-batch-writer.mjs`| 走**阿里云批处理 Embedding API**：上传文件拿临时 URL → 提交批任务 → 轮询 → 下载 gzip 结果 → 入库 |
| `file-server.mjs`       | 一个极简 HTTP 静态服务器，给批处理 API 提供可访问的文件 URL             |
| `test-llm.mjs`          | 单独验证 LLM 连通性                                                     |

- **断点续传**：`ebook-writer.mjs` 每次入库前先 `query` 出该 `book_id` 已插入的 `chapter_num` 集合，跳过已完成章节；进程中断后重跑不会重复插入，也可用命令行参数指定起始章节
- **两级切分**：EPUB 先按章拆（`splitChapters: true`），每章再按 500 字 + 50 字重叠二次切分，兼顾章节归属与检索粒度
- **规避 SDK bug**：`ebook-reader-rag.mjs` 没用 LangChain 的 model，而是手写 `fetch` 调 `/v1/chat/completions` 并加 20 秒超时，绕开当时 LangChain Responses API 的问题
- **批处理省钱提速**：整本书上千个片段逐个调 Embedding 又慢又贵，`ebook-batch-writer.mjs` 演示如何用阿里云异步批处理接口一次性算完再入库

## 运行方式

先配 `.env`：向量相关 `EMBEDDING_API_KEY` / `EMBEDDING_BASE_URL` / `EMBEDDING_MODEL` / `EMBEDDING_DIM`，问答相关 `MODEL` / `API_KEY` / `BASE_URL`，再加 `MILVUS_ADDRESS`（默认 `localhost:19530`）和 `EBOOK_COLLECTION_NAME`。`EMBEDDING_MODEL` 必须是 `BASE_URL` 实际提供的模型，`EMBEDDING_DIM` 要和该模型输出维度一致。

启动 Milvus——目录下有三份 compose，按机器选：

| 文件                                          | 镜像版本      | 适用场景                                       |
| --------------------------------------------- | ------------- | ---------------------------------------------- |
| `milvus-standalone-docker-compose.yml`        | milvus v2.6.13 | 官方镜像，x86 或网络能拉到 Docker Hub 时       |
| `milvus-standalone-docker-compose-arm64.yml`  | milvus v2.4.17 | **Apple Silicon 首选**，旧版对 QEMU 模拟更宽容 |
| `milvus-standalone-docker-compose-ali.yml`    | milvus v2.5.3  | 阿里云镜像源，拉不到 Docker Hub 时的备选        |

```bash
# 1. 启动 Milvus（Apple Silicon 用 arm64 版）
docker compose -f src/mivlus/milvus-standalone-docker-compose-arm64.yml up -d

# 2. ai-diary：CRUD + RAG
pnpm dev src/mivlus/ai-diary/insert.mjs    # 建集合+建索引+加载+插入
pnpm dev src/mivlus/ai-diary/query.mjs     # 向量检索
pnpm dev src/mivlus/ai-diary/list.mjs      # 标量过滤 + 按主键取
pnpm dev src/mivlus/ai-diary/update.mjs    # upsert 更新
pnpm dev src/mivlus/ai-diary/delete.mjs    # 删除
pnpm dev src/mivlus/ai-diary/rag.mjs       # 检索增强问答

# 3. book-test：电子书 RAG
pnpm dev src/mivlus/book-test/ebook-writer.mjs        # 分章入库（可加起始章节号续传）
pnpm dev src/mivlus/book-test/ebook-query.mjs         # 纯向量检索
pnpm dev src/mivlus/book-test/ebook-reader-rag.mjs    # RAG 问答
```

## 踩坑提醒

- **Apple Silicon 上别用 amd64 镜像**：`ali`/默认 compose 的 milvus 在 arm64 下靠 QEMU 模拟运行，standalone 常因连 etcd 超时而 panic，换 `arm64.yml`（v2.4.17）即可稳定启动
- **检索前必须 load**：重启 Milvus 后集合会卸载，直接 `search` 会报错，需先 `loadCollection`
- **row_count 要先 flush**：`getCollectionStatistics` 只统计已落盘的 segment，`list.mjs` 里先 `flush` 再统计才准
- 向量检索需先启动 Milvus，建议给 Docker 4GB+ 内存，详见 [踩坑记录](../troubleshooting.md)。

## 扩展方向

- 为日记增加地理位置字段，支持基于地点的标量过滤检索
- 对比 `IVF_SQ8`、`HNSW` 等索引类型的检索性能与准确率
- 电子书问答增加对话历史，支持多轮追问
- 实现混合检索：向量检索 + 关键词精确匹配（章节号、角色名）
- 用 `partition` 按书隔离数据，支持多本书共存与按书检索

---

⬅️ [文本分割器](./07-text-splitter.md) ｜ [📚 目录](../../README.md#目录) ｜ [对话记忆管理 ➡️](./09-conversation-memory.md)
