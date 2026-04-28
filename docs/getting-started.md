# 🚀 快速开始

> 本文档说明如何准备运行环境、安装依赖、配置环境变量。完成本节后，再去 [章节目录](./../README.md#-章节目录) 选择感兴趣的示例运行。

---

## 📦 环境要求

| 依赖    | 版本要求 | 说明                              |
| ------- | -------- | --------------------------------- |
| Node.js | 18+      | 部分 MCP 服务要求更高版本，见下方 |
| pnpm    | latest   | 包管理器                          |
| 模型服务 | -        | 一个可用的 OpenAI 兼容模型服务    |

> ⚠️ 第 3 章的 `chrome-devtools-mcp` 需要 Node `^20.19.0 || ^22.12.0 || >=23`，详见 [踩坑记录](./troubleshooting.md#3-chrome-devtools-mcp-对-node-版本有要求)。

---

## ⬇️ 安装依赖

在仓库根目录执行：

```bash
pnpm install
```

如果你也想单独运行前端示例，再进入子项目安装一次：

```bash
cd react-todo-app
pnpm install
```

> 💡 `src/asr-and-tts-nest-service`、`src/cron-job-tool`、`src/agui-backend`、`src/agui-frontend` 等子项目需要单独 `cd` 进去再 `pnpm install`，参见对应章节文档。

---

## 🔧 环境变量

### 基础配置（必填）

根目录 `.env` 需要提供：

```bash
MODEL=your-model-name
API_KEY=your-api-key
BASE_URL=https://your-openai-compatible-endpoint
```

| 变量       | 说明                       |
| ---------- | -------------------------- |
| `MODEL`    | 模型名称                   |
| `API_KEY`  | 接口密钥                   |
| `BASE_URL` | OpenAI 兼容接口地址        |

---

### 高德地图 + filesystem MCP（可选）

如果你要运行高德地图 MCP 示例（第 3 章），还需要：

```bash
AMAP_MAPS_API_KEY=your-amap-key
ALLOWED_PATHS=/absolute/path/one,/absolute/path/two
```

| 变量                | 说明                                                       |
| ------------------- | ---------------------------------------------------------- |
| `AMAP_MAPS_API_KEY` | 高德地图 MCP 服务使用的 Key                                |
| `ALLOWED_PATHS`     | filesystem MCP 可访问的绝对路径列表，多个路径用英文逗号分隔 |

---

### 向量检索（可选）

如果你要运行向量检索示例（第 4/8 章等），还可以额外提供：

```bash
EMBEDDINGS_BASE_URL=https://your-embeddings-endpoint
EMBEDDINGS_API_KEY=your-embeddings-key
EMBEDDINGS_MODEL=text-embedding-3-small
```

> 💡 如果不提供 `EMBEDDINGS_*`，当前示例会优先回退到 `API_KEY / BASE_URL`，再不行就自动降级为关键词检索。

---

### 互联网搜索（可选）

如果你要运行 Nest + Tool Calling AI 智能助手示例（第 14 章）的互联网搜索功能，还需要配置 Bocha API Key：

```bash
BOCHA_API_KEY=your-bocha-api-key
```

| 变量            | 说明                                                  |
| --------------- | ----------------------------------------------------- |
| `BOCHA_API_KEY` | Bocha Web Search API 密钥（用于互联网搜索工具）       |

> 💡 如果不提供 `BOCHA_API_KEY`，AI 会在调用搜索工具时返回"API Key 未配置"的提示。

---

### 邮件发送（可选）

如果你要运行 Nest + Tool Calling AI 智能助手示例（第 14 章）的邮件发送功能，还需要配置 SMTP 信息：

```bash
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@example.com
MAIL_PASS=your-password
MAIL_FROM=your-email@example.com
```

| 变量          | 说明                              |
| ------------- | --------------------------------- |
| `MAIL_HOST`   | SMTP 服务器地址                   |
| `MAIL_PORT`   | SMTP 端口（465=SSL, 587=TLS）     |
| `MAIL_SECURE` | 是否使用 SSL（`true`/`false`）    |
| `MAIL_USER`   | SMTP 用户名                       |
| `MAIL_PASS`   | SMTP 密码                         |
| `MAIL_FROM`   | 发件人邮箱地址                    |

---

### 数据库（可选）

如果你要运行智能录入与 Mini Cursor Agent 示例（第 10 章），还需要配置数据库环境变量：

```bash
# 在 src/output-parse-demo/.env 中配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root123456
DB_NAME=hello
```

| 变量          | 说明                              |
| ------------- | --------------------------------- |
| `DB_HOST`     | MySQL 服务器地址（默认 localhost） |
| `DB_PORT`     | MySQL 端口（默认 3306）           |
| `DB_USER`     | 数据库用户名                      |
| `DB_PASSWORD` | 数据库密码                        |
| `DB_NAME`     | 数据库名称                        |

> 💡 如果使用 Docker Compose 启动 MySQL，密码应与 `docker-compose-mysql.yml` 中的 `MYSQL_ROOT_PASSWORD` 一致。

---

## ➡️ 下一步

环境就绪后，前往：

- 📚 [章节目录](./../README.md#-章节目录) 按章节学习
- 🗺️ [推荐学习顺序](./learning-path.md) 查看建议的学习路径
- 📁 [项目结构总览](./project-structure.md) 了解整个仓库的组织方式
