# 第 2 章：MCP Server 基础

> 学习 MCP（Model Context Protocol）协议的基础写法：Tool、Resource 定义、stdio 通信、Zod 参数校验。

---

## 📖 章节简介

- **文件**：`src/demo/mcp-server.mjs`
- **内容**：Tool、Resource 定义，stdio 通信，zod 参数校验
- **重点**：理解 MCP 协议的基本组成

---

## 📁 涉及文件

### MCP Server 示例

- `src/demo/mcp-server.mjs`：MCP Server 基础示例（`query_user` 工具 + `docs://guide` 资源）

---

## 🚀 如何运行

这个 Server 采用 `stdio` 通信，通常**不是你在终端里手动交互**，而是由 MCP Client 启动，例如 Cursor、Claude Desktop 或其他支持 MCP 的工具。

### 直接运行（仅观察）

```bash
node src/mcp-server.mjs
```

进程通常会保持等待状态，这是正常的，因为它在等待 MCP Client 通过标准输入输出与它通信。

### 在 MCP Client 中注册

如果某个客户端支持通过命令注册 MCP Server，通常可以配置成下面这样：

```json
{
  "mcpServers": {
    "demo-agent": {
      "command": "node",
      "args": ["/path/to/demo-agent/src/mcp-server.mjs"]
    }
  }
}
```

### 测试请求

启动后，你可以让客户端尝试类似请求：

- `查询用户 001 的信息`
- `读取 docs://guide 这个资源`
- `查询用户 999 的信息`

> 💡 当前示例内置的可查询用户 ID 为：`001`、`002`、`003`。

---

## ✏️ 动手练习

你也可以把这部分当成一个小练习：

1. 先查询一个存在的用户，观察工具返回内容
2. 再查询一个不存在的用户，观察错误提示怎么返回
3. 再读取 `docs://guide`，感受 Resource 和 Tool 的区别

更多 MCP 相关练习参见 [练习 - MCP 相关练习](./../exercises.md#-mcp-相关练习)：

1. 在 `src/mcp-server.mjs` 里新增一个 `list_users` 工具
2. 给 `query_user` 增加更多字段
3. 新增一个资源，比如 `docs://users`
4. 把内存数据库拆到单独文件里
5. 对照 `src/tool-runner.mjs`，思考 Agent 与 MCP 的本质差异

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 1 章 Agent 基础](./01-agent-basic.md) | [章节目录](./../../README.md#-章节目录) | [第 3 章 多 MCP Server 集成](./03-multi-mcp.md) |
