# Neo4j 知识图谱与 Graph RAG

> [GraphRAG] 20 — 用 Neo4j 构建知识图谱，结合 LangGraph 实现基于图的检索增强生成。

## 核心思路

传统 RAG 基于向量相似度检索文本片段，Graph RAG 则利用**知识图谱的结构化关系**进行多跳推理：

1. **用户提问** → LLM 生成 Cypher 查询语句
2. **执行 Cypher** → 从 Neo4j 图数据库检索结构化结果
3. **生成回答** → LLM 基于检索结果回答用户问题

## 工作流

```
用户问题 → generateCypher → executeGraph → generateAnswer → 最终回答
```

三个节点通过 LangGraph `StateGraph` 串联，状态包含 `messages`、`cypher`、`context`、`answer` 四个通道。

## 模块结构

| 文件 | 说明 |
|------|------|
| `src/graphrag.mjs` | 主流程：Cypher 生成 → 图查询 → 答案生成 |
| `seed-neo4j.mjs` | 数据导入脚本：创建节点和关系，含验证查询 |
| `cypher.md` | Cypher 语句参考文档 |
| `docker-compose.yml` | Neo4j 容器配置（含 APOC 插件） |
| `utils/model.mjs` | 公共模型配置（读取 `.env`） |
| `utils/config.util.mjs` | 环境变量加载工具 |

## 知识图谱 Schema

```
(Product)-[:属于]->(Type)
(Product)-[:包含]->(Ingredient)
(Product)-[:适合]->(People)
(Ingredient)-[:使用]->(Method)
```

所有节点属性名均为 `name`（英文），关系名为中文。

## 环境变量

在项目根目录 `.env` 中配置（已在 `.env.example` 中定义）：

```bash
NEO4J_HOST=localhost
NEO4J_HTTP_PORT=7474
NEO4J_BOLT_PORT=7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
NEO4J_AUTH=neo4j/your_password   # docker-compose 使用
```

## 快速启动

```bash
# 1. 启动 Neo4j 容器
cd src/neo4j-graphrag
pnpm docker:up

# 2. 导入知识图谱数据
node seed-neo4j.mjs

# 3. 运行 GraphRAG
pnpm dev src/neo4j-graphrag/src/graphrag.mjs
```

Neo4j 浏览器管理界面：`http://localhost:7474`

## 关键设计

### Prompt 约束

生成 Cypher 的 prompt 中需要**明确声明节点属性名和示例值**，否则 LLM 容易将 `name` 翻译成中文 `名称`，导致查询结果为空。

### 错误处理

`executeGraphQuery` 捕获 Cypher 执行异常后返回兜底文案，避免整个流程崩溃。

---

## ➡️ 下一步

- 扩展图谱规模（更多产品、配料、关系）
- 引入 Schema 自动发现（`graph.getSchema()`）替代手写 prompt
- 结合向量检索实现 Hybrid RAG（图 + 向量双路召回）
