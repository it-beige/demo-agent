# 🐛 踩坑记录与注意事项

> 本文档汇集本仓库实际开发与学习过程中遇到的真实坑点，以及运行示例时需要注意的事项。**强烈建议在动手前先翻一遍。**

---

## 🧷 MCP 配置踩坑记录

这部分是这次学习里非常容易踩到的几个真实问题。

### 1. filesystem MCP 的路径参数不能拼成一个字符串

❌ 错误写法思路：

```js
process.env.ALLOWED_PATHS.split(',').join(' ')
```

这会把多个目录拼成一个参数字符串，结果 `server-filesystem` 接收到的不是多个独立路径。

✅ 正确思路是把它展开成多个参数：

```js
const allowedPaths = process.env.ALLOWED_PATHS.split(',')
  .map(v => v.trim())
  .filter(Boolean)
args: ['-y', '@modelcontextprotocol/server-filesystem', ...allowedPaths]
```

如果写在 `mcp.json` 里，就直接把多个路径静态展开写进去。

---

### 2. filesystem 必须放在 `mcpServers` 里

`MultiServerMCPClient` 只会读取 `mcpServers` 下声明的服务。如果把 `filesystem` 写到 `mcpServers` 外层，客户端不会加载它。

---

### 3. `chrome-devtools-mcp` 对 Node 版本有要求

这次实际遇到的问题是：

- 当前 Node：`v20.11.1`
- `chrome-devtools-mcp@0.21.0` 要求：`^20.19.0 || ^22.12.0 || >=23`

如果 MCP Client 启动它时报 `EBADENGINE` 或 `Client closed`，**优先检查 Node 版本**。

对 GUI 客户端，最稳的方式不是依赖 `nvm use`，而是在配置里直接写新版 `npx` 的绝对路径，例如：

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "/Users/chenkun/.nvm/versions/node/v22.22.1/bin/npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

---

## ⚠️ 注意事项

### 仓库定位

- 这是一个**学习仓库**，重点是帮助理解思路，不是生产环境最佳实践
- `command-execute` 直接执行 shell 命令，真实场景需要更严格的权限和安全限制
- 当前根项目没有自动化测试
- 如果你准备继续扩展，建议优先补上脚本、日志和错误处理

### 向量检索 / Milvus

- 运行检索策略示例前，需要先启动 Milvus 服务（参考 Docker Compose 配置）
- Milvus 向量数据库占用内存较大，建议至少分配 **4GB 以上内存**

### 智能录入与 Mini Cursor Agent

- 运行智能录入与 Mini Cursor Agent 示例前，需要先启动 MySQL 服务
- 数据库密码不要硬编码在代码中，务必使用 `.env` 文件管理
- `mini-cursor.mjs` 会**实际执行命令和写入文件**，建议在测试目录中运行

### Nest + LangChain 流式 AI 接口

- 运行 Nest + LangChain 流式 AI 接口示例前，需要先在根目录 `.env` 中配置 `MODEL`、`API_KEY`、`BASE_URL`
- `asr-and-tts-nest-service` 项目需要单独安装依赖（`cd src/asr-and-tts-nest-service && pnpm install`）
- SSE 连接长时间空闲可能被代理服务器断开，**生产环境需要添加心跳机制**

### Nest + Tool Calling AI 智能助手

- `cron-job-tool` 项目需要单独安装依赖（`cd src/cron-job-tool && pnpm install`）
- 运行 `cron-job-tool` 互联网搜索功能需要在 `.env` 中配置 `BOCHA_API_KEY`
- 运行 `cron-job-tool` 邮件发送功能需要安装 `@nestjs-modules/mailer` 并配置 SMTP 环境变量

---

## ➡️ 下一步

- 📚 回到 [章节目录](./../README.md#-章节目录)
- 🚀 查看 [快速开始](./getting-started.md)
- 🌱 查看 [后续扩展方向](./roadmap.md)
