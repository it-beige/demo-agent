# [MCP] Tool/Resource 定义与 stdio 通信

> 实现一个最小可用的 MCP Server：通过 stdio 协议暴露工具和资源，供 Cursor / Claude Desktop 等 MCP Client 调用。
> **关键词**：MCP 协议、Tool、Resource、stdio、Zod 校验

## 核心设计

MCP Server 不直接面向用户交互，它通过标准输入输出（stdio）与 MCP Client 通信。这个 demo 实现了两个核心 MCP 概念：

- **Tool**（`query_user`）：接收参数、执行逻辑、返回结果。使用 Zod Schema 定义参数类型，MCP Client 会自动识别参数结构
- **Resource**（`docs://guide`）：暴露静态文档内容，Client 可以像读文件一样读取

Server 内置 3 个用户（001-003）作为 mock 数据，演示 Tool 的正常返回和错误处理（查询不存在的用户时返回结构化错误提示）。

## 运行方式

MCP Server 通过 stdio 通信，通常由 MCP Client 启动而非手动运行。在 Cursor 或类似工具中注册：

```json
{
  "mcpServers": {
    "demo-agent": {
      "command": "node",
      "args": ["/path/to/demo-agent/src/demo/mcp-server.mjs"]
    }
  }
}
```

注册后在客户端尝试：
- `查询用户 001 的信息` → 返回用户详情
- `读取 docs://guide 这个资源` → 返回资源内容
- `查询用户 999 的信息` → 返回错误提示

## 扩展方向

- 新增 `list_users` 工具，返回所有用户列表
- 把内存 mock 数据替换为真实数据库或外部 API
- 新增更多 Resource 类型，理解 Tool 和 Resource 在协议层面的差异

---
⬅️ [ReAct 循环](./01-agent-basic.md) ｜ [📚 目录](../../README.md#目录) ｜ [多 MCP Server ➡️](./03-multi-mcp.md)