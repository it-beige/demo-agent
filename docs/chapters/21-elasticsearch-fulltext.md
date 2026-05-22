# [Retrieval] ElasticSearch 全文检索：倒排索引 + IK 分词器 + BM25 算法

## 核心设计

基于 ElasticSearch 8.17 实现中文全文检索。倒排索引将文档拆分为词项→文档映射，IK 分词器处理中文语义切分（入库 `ik_max_word` 细粒度、查询 `ik_smart` 粗粒度匹配），BM25 算法对搜索结果相关性打分排序。通过 Docker Compose 一键启动 ES + Kibana 开发环境，`es-test3-runner.mjs` 跑通索引创建→文档 CRUD→全文检索→分词验证→高亮返回的完整链路。

| 组件      | 作用                                            |
| --------- | ----------------------------------------------- |
| 倒排索引  | 词项 → 文档 ID 映射，O(1) 定位                  |
| IK 分词器 | `ik_max_word`（入库）/ `ik_smart`（查询）双模式 |
| BM25      | TF-IDF 改进版，考虑文档长度归一化               |
| Kibana    | DevTools 控制台，直接执行 REST API              |

## 运行方式

```bash
cd src/elastic-search      # 进入 elastic-search 目录
docker compose up -d       # 启动 ES + Kibana（首次启动需等 ES 就绪）
pnpm dev src/elastic-search/es-test3-runner.mjs   # 跑全量测试
```

启动后 Kibana 控制台 `http://localhost:5601` → DevTools，可直接执行 `es-test*.md` 中的命令。

## 扩展方向

- 结合大模型实现混合检索：BM25 关键词召回 + Embedding 语义召回 → RRF 融合排序
- 引入同义词词典和自定义停用词表，提升特定业务场景下的召回率
- 将 ES 检索能力封装为 MCP Tool，供 Agent 在 ReAct 循环中调用

---

⬅️ [Docker Compose 部署](./20-docker-compose-deploy.md) ｜ [📚 目录](../../README.md#目录) ｜ ➡️ [LangSmith 全链路观测](./24-langsmith-observability.md)
