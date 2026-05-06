# [MCP·Client] 多 MCP Server 集成与工具调度

> 使用 `MultiServerMCPClient` 同时挂载高德地图 MCP 和 filesystem MCP，模型在多个 Server 的工具池中自主选择调用。
> **关键词**：MultiServerMCPClient、高德地图、filesystem、工具路由

## 核心设计

当存在多个 MCP Server 时，模型面对的是一组来自不同来源的工具。这个 demo 的核心挑战是：模型能否在"查地图"和"读文件"之间正确选择。

`MultiServerMCPClient` 负责同时管理两个 stdio 连接（高德地图 MCP 进程 + filesystem MCP 进程），将它们的工具集合并后交给模型。模型在一次对话中可能先调 filesystem 列出文件，再调高德地图查周边酒店——路由决策完全由模型自己完成。

filesystem MCP 通过 `ALLOWED_PATHS` 环境变量限制可访问目录，这是安全边界的关键设计：即使模型决策失误，工具层面也不会越权访问。

## 运行方式

先在 `.env` 中配置 `AMAP_MAPS_API_KEY` 和 `ALLOWED_PATHS`，然后：

```bash
pnpm dev src/demo/mcp-amap.mjs "查一下北京南站三公里附近的酒店"
pnpm dev src/demo/mcp-amap.mjs "列出 /Users/chenkun/Desktop 下的文件"
```

观察重点：模型能否先选中正确的工具；filesystem 是否只能访问允许的目录；工具结果不足时模型是否明确说"不确定"而非瞎编。

## 踩坑提醒

- filesystem MCP 的路径参数必须拆成数组，不能拼成字符串
- filesystem 必须配置在 `mcpServers` 而非 `dependencies` 里
- `chrome-devtools-mcp` 需要 Node >= 20.19.0

详见 [踩坑记录](../troubleshooting.md)。

## 扩展方向

- 接入更多 MCP Server（如 GitHub MCP、Postgres MCP），观察模型在更多工具间路由的表现
- 为工具调用增加超时和降级策略

---
⬅️ [MCP Server 基础](./02-mcp-server-basic.md) ｜ [📚 目录](../../README.md#目录) ｜ [RAG 检索增强 ➡️](./04-rag.md)