# 踩坑记录

> 实际开发中遇到的真实坑点，动手前先翻一遍。

## MCP 配置

### filesystem MCP 路径参数不能拼成字符串

❌ `process.env.ALLOWED_PATHS.split(',').join(' ')` 会把多目录拼成一个参数

✅ 展开成多个参数：

```js
const allowedPaths = process.env.ALLOWED_PATHS.split(',').map(v => v.trim()).filter(Boolean)
args: ['-y', '@modelcontextprotocol/server-filesystem', ...allowedPaths]
```

### filesystem 必须放在 `mcpServers` 里

`MultiServerMCPClient` 只读取 `mcpServers` 下的声明，写外层不加载。

### chrome-devtools-mcp 对 Node 版本有要求

`chrome-devtools-mcp@0.21.0` 要求 `^20.19.0 || ^22.12.0 || >=23`，版本不够时报 `EBADENGINE`。

解决：在 MCP 配置里直接写新版 npx 绝对路径：

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "/Users/xxx/.nvm/versions/node/v22.22.1/bin/npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

## 注意事项

- 这是学习仓库，非生产最佳实践
- `command-execute` 直接执行 shell 命令，真实场景需要权限限制
- 向量检索需先启动 Milvus，建议 4GB+ 内存
- 智能录入需先启动 MySQL，密码务必用 `.env` 管理
- NestJS 子项目需单独 `cd` 进去 `pnpm install`
- SSE 连接长时间空闲可能被反向代理断开，生产环境加心跳
- 邮件功能需额外安装 `@nestjs-modules/mailer` 并配 SMTP

---

## ➡️ 下一步

- 📚 回到 [目录](./../README.md#目录)
- 🚀 查看 [快速开始](./getting-started.md)
- 🌱 查看 [后续扩展方向](./roadmap.md)