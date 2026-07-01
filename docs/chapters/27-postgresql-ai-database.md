# [Database] PostgreSQL：AI 时代最适合的数据库

> 通过 pgvector 扩展，PostgreSQL 同时拥有了关系型数据库的事务能力和向量数据库的语义检索能力。本章用两个模块演示同一套数据模型（用户 → 会话 → 消息）的两种工程实践：`pgsql-test` 用原生 `pg` 驱动 + 手写 SQL，`typeorm-pg-crud` 用 TypeORM + NestJS 构建 RESTful API。
> **关键词**：pgvector、HNSW 索引、余弦相似度、node-postgres、TypeORM、NestJS、向量检索、语义搜索

## 为什么是 PostgreSQL

AI 应用离不开向量检索（RAG、语义搜索、推荐系统）。传统方案需要同时维护关系型数据库 + 专用向量数据库（Milvus、Pinecone），带来数据一致性、运维复杂度、JOIN 不可用等问题。pgvector 扩展让 PostgreSQL 原生支持向量存储与检索，一库搞定一切：

| 能力 | 纯关系型 DB | 专用向量 DB | PostgreSQL + pgvector |
| ---- | ----------- | ----------- | --------------------- |
| 事务一致性 | ✅ | ❌ | ✅ |
| 向量检索 | ❌ | ✅ | ✅ |
| JOIN 查询 | ✅ | ❌ | ✅ |
| 运维复杂度 | 低 | 高 | 低 |
| 生态成熟度 | 高 | 低 | 高 |

## 核心数据模型

两个模块共用同一套数据库 Schema，三张表通过外键级联删除关联：

```
users (用户表)
  │  1 : N
  ▼
conversations (会话表)
  │  1 : N
  ▼
messages (消息表)  ← embedding 字段：vector(1024) 向量列
```

| 表            | 关键字段                                        | 说明                          |
| ------------- | ----------------------------------------------- | ----------------------------- |
| `users`       | `id`, `name`, `created_at`                      | SERIAL 自增主键               |
| `conversations` | `user_id` FK → users, `title`                 | ON DELETE CASCADE 级联删除    |
| `messages`    | `conversation_id` FK → conversations, `role` CHECK, `content`, `embedding vector(1024)` | role 限定 user/assistant/system |

向量索引使用 HNSW（分层可导航小世界图）算法，配合余弦距离运算符 `<=>`：

```sql
CREATE INDEX idx_messages_embedding
    ON messages USING hnsw (embedding vector_cosine_ops);
```

## 模块一：pgsql-test — 原生 SQL 实践

### 技术栈

| 组件          | 技术                          | 作用                         |
| ------------- | ----------------------------- | ---------------------------- |
| 数据库        | PostgreSQL 16 + pgvector      | Docker Compose 一键启动      |
| GUI           | pgAdmin 4                     | `http://localhost:8088` 可视化 |
| Node.js 驱动  | `pg`（node-postgres）         | 连接池 + 参数化查询          |
| Embedding     | `@langchain/openai`           | 复用 `shared/model.mjs` 单例 |

### 代码结构

```
src/pgsql-test/
├── docker-compose.yml          # PostgreSQL + pgAdmin 容器编排
├── init-scripts/
│   └── create_tables.sql       # 建表 + 向量扩展 + HNSW 索引
├── src/
│   ├── db.mjs                  # 连接池（Pool）+ query 封装
│   ├── users.mjs               # 用户 CRUD（5 个函数）
│   ├── conversations.mjs       # 会话 CRUD（6 个函数）
│   ├── messages.mjs            # 消息 CRUD + 向量写入 + 语义检索
│   └── index.mjs               # 演示入口：CRUD → 写入 embedding → 语义搜索
```

### 关键设计

**连接池管理**（`db.mjs`）：通过 `pg.Pool` 维护连接池，`query(text, params)` 统一出口，`$1/$2` 占位符防 SQL 注入。程序退出时 `pool.end()` 优雅关闭。

**Embedding 复用**（`messages.mjs`）：直接导入 `shared/model.mjs` 的 `embeddings` 单例，无需手写 `OpenAIEmbeddings` 初始化逻辑，环境变量由 `loadEnvFromNearest` 自动加载。

**语义检索核心 SQL**：

```sql
-- 1 - 余弦距离 = 余弦相似度（值越大越相似）
SELECT id, role, content,
       1 - (embedding <=> $1::vector) AS similarity
FROM messages
WHERE conversation_id = $2 AND embedding IS NOT NULL
ORDER BY embedding <=> $1::vector   -- 按距离升序，HNSW 索引加速
LIMIT $3
```

`<=>` 是 pgvector 的余弦距离运算符，返回 `[0, 2]`：0 表示完全相同，1 表示正交。`1 - (embedding <=> query)` 将距离转为相似度，更符合直觉。

### 运行方式

```bash
# 1. 启动数据库
cd src/pgsql-test && docker compose up -d

# 2. 运行演示（需设置 DATABASE_URL）
cd /path/to/demo-agent
export DATABASE_URL="postgresql://user:Aa123456@localhost:5432/hello_pg"
pnpm dev src/pgsql-test/src/index.mjs
```

## 模块二：typeorm-pg-crud — TypeORM + NestJS 工程化

### 技术栈

| 组件          | 技术                          | 作用                               |
| ------------- | ----------------------------- | ---------------------------------- |
| ORM           | TypeORM 1.0                   | 实体映射 + 关系管理 + Schema 同步  |
| 框架          | NestJS 11                     | 依赖注入 + 路由 + 中间件           |
| 数据库        | PostgreSQL 16 + pgvector      | 复用 pgsql-test 的 Docker 容器     |
| Embedding     | `@langchain/openai`           | Service 内懒加载单例               |

### 代码结构

```
src/typeorm-pg-crud/
├── src/
│   ├── main.ts                                # NestJS 启动入口（端口 3005）
│   ├── app.module.ts                          # TypeOrmModule.forRoot + 实体注册
│   ├── conversations/
│   │   ├── entities/
│   │   │   ├── user.entity.ts                 # @Entity + @OneToMany
│   │   │   ├── conversation.entity.ts         # @ManyToOne + @JoinColumn
│   │   │   └── message.entity.ts              # @Column('vector', { length: 1024 })
│   │   ├── dto/
│   │   │   └── semantic-search.dto.ts         # { query: string, limit?: number }
│   │   ├── conversations.controller.ts        # 3 个 RESTful 端点
│   │   ├── conversations.service.ts           # EntityManager + 原生 SQL 向量检索
│   │   └── conversations.module.ts            # 模块注册
│   └── app.controller.ts                      # 健康检查 GET /
└── test-curl.md                               # curl 测试命令
```

### 关键设计

**实体关系映射**：TypeORM 通过装饰器声明表结构和关系。`@ManyToOne` + `@JoinColumn` 自动处理外键，`onDelete: 'CASCADE'` 与数据库级联删除一致。

**vector 列映射**：

```typescript
@Column('vector', { length: 1024, nullable: true })
embedding: number[] | null;
```

TypeORM 1.0 原生支持 `vector` 列类型，`length` 指定向量维度。`synchronize: true` 启动时自动同步 Schema（注意：会删除手动创建的 HNSW 索引，需重建）。

**三个 API 端点**：

| 方法   | 路径                              | 功能                |
| ------ | --------------------------------- | ------------------- |
| GET    | `/conversations/users/:userId`    | 用户的会话列表      |
| GET    | `/conversations/:id/messages`     | 会话的消息列表      |
| POST   | `/conversations/:id/search`       | 会话内语义检索      |

语义检索在 Service 层通过 `EntityManager.query()` 执行原生 SQL，与 pgsql-test 的查询逻辑一致。

### 运行方式

```bash
# 1. 确保 PostgreSQL 容器已启动（复用 pgsql-test 的 Docker）
cd src/pgsql-test && docker compose up -d

# 2. 设置环境变量并启动 NestJS
cd /path/to/demo-agent
set -a && source .env && set +a
export OPENAI_API_KEY="$EMBEDDING_API_KEY"
export OPENAI_BASE_URL="$EMBEDDING_BASE_URL"
cd src/typeorm-pg-crud && npx nest start
```

### 接口验证

```bash
# 用户 → 会话列表
curl -s http://localhost:3005/conversations/users/3 | jq

# 会话 → 消息列表
curl -s http://localhost:3005/conversations/3/messages | jq

# 语义检索
curl -s -X POST http://localhost:3005/conversations/3/search \
  -H 'Content-Type: application/json' \
  -d '{"query":"向量相似度怎么查","limit":3}' | jq
```

## 两种方案对比

| 维度       | pgsql-test（原生 SQL）       | typeorm-pg-crud（TypeORM + NestJS） |
| ---------- | ---------------------------- | ----------------------------------- |
| 适用场景   | 学习、脚本、快速原型         | 生产服务、团队协作、RESTful API     |
| SQL 控制   | 完全手写，精确控制           | CRUD 自动生成，复杂查询回退原生 SQL |
| Schema 管理 | 手动 SQL 脚本               | `synchronize: true` 自动同步        |
| 依赖注入   | 无                           | NestJS IoC 容器                     |
| 关系查询   | 手写 JOIN                    | `relations` 自动 JOIN               |
| 类型安全   | 无（纯 JS）                  | TypeScript 实体类型                 |
| 向量检索   | `pool.query()` + 原生 SQL    | `em.query()` + 原生 SQL（一致）     |

## 扩展方向

- 将 pgvector 语义检索封装为 MCP Tool，供 Agent 在 ReAct 循环中调用
- 实现混合检索：pgvector 语义召回 + ElasticSearch 关键词召回 → RRF 融合排序
- 结合 `synchronize: false` + 迁移脚本（migration）管理 Schema 变更，避免索引丢失
- 扩展向量维度适配：通过 `EMBEDDING_DIM` 环境变量动态调整 `vector(N)` 维度

---

⬅️ [DeepAgents 实战](./26-deep-research-assistant.md) ｜ [📚 目录](../../README.md#目录) ｜ [Redis Agent 短期记忆 ➡️](./28-redis-agent-memory.md)
