# 快速开始

> 环境准备 + 依赖安装 + 环境变量。搞完这些就能跑任意章节的 demo 了。

## 环境要求

- Node.js 20+
- pnpm latest
- 一个可用的 OpenAI 兼容模型服务

## 安装依赖

````bash
# 根目录
pnpm install

### 环境变量

```bash
MODEL=deepseek-chat
API_KEY=sk-xxx
BASE_URL=https://api.deepseek.com/v1
````

| 变量       | 说明                |
| ---------- | ------------------- |
| `MODEL`    | 模型名称            |
| `API_KEY`  | 接口密钥            |
| `BASE_URL` | OpenAI 兼容接口地址 |

### 向量检索（可选）

```bash
EMBEDDINGS_BASE_URL=https://your-embeddings-endpoint
EMBEDDINGS_API_KEY=sk-xxx
EMBEDDINGS_MODEL=text-embedding-3-small
```

不提供则回退到 `API_KEY/BASE_URL`，再不行降级为关键词检索。

### 高德地图 + filesystem MCP（可选）

```bash
AMAP_MAPS_API_KEY=your-amap-key
ALLOWED_PATHS=/absolute/path/one,/absolute/path/two
```

### 互联网搜索（可选）

```bash
BOCHA_API_KEY=your-bocha-api-key
```

### 邮件发送（可选）

```bash
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@example.com
MAIL_PASS=your-password
MAIL_FROM=your-email@example.com
```

### MySQL 数据库（可选）

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=demo_user
DB_PASSWORD=<强密码>
DB_NAME=demo_db
```

启动 Docker MySQL：

```bash
docker-compose --env-file .env -f src/output-parse-demo/docker-compose-mysql.yml up -d
```

### 腾讯云 TTS/ASR（可选）

```bash
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
```

## ➡️ 下一步

环境就绪后，前往：

- 📚 [目录](./../README.md#目录) 按章节阅读
- 🗺️ [推荐实践顺序](./learning-path.md) 查看建议的阅读路径
- 📁 [项目结构总览](./project-structure.md) 了解整个仓库的组织方式
