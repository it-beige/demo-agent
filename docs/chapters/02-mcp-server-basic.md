# [MCP] Tool/Resource 定义与 stdio 通信

> 实现一个最小可用的 MCP Server：通过 stdio 协议暴露工具和资源，供 Cursor / Claude Desktop 等 MCP Client 调用。
> **关键词**：MCP 协议、Tool、Resource、URI 模板、stdio、Zod 校验

## 核心设计

MCP Server 不直接面向用户交互，它通过标准输入输出（stdio）与 MCP Client 通信。Server 内置 3 个用户（001-003）作为 mock 数据，同一份数据分别以 Tool 和 Resource 两种形式暴露，用来对比这两个原语在协议层面的差异。

**Tool** 是模型自主调用的能力入口，参数用 Zod Schema 定义，MCP Client 会自动识别参数结构：

- **`query_user`**：按 ID 查单个用户。查不到时返回结构化错误提示而非抛异常，模型可据此换参数重试
- **`list_users`**：返回全部用户列表。无参工具的 `inputSchema` 写成空对象 `{}`，SDK 会生成 `properties` 为空的 JSON Schema

**Resource** 是以 URI 寻址的只读数据，由宿主应用决定读哪一个、何时写入上下文。四种形态覆盖了常见用法：

| URI                               | mimeType           | 形态      | 关键点                                        |
| --------------------------------- | ------------------ | --------- | --------------------------------------------- |
| `docs://guide`                    | `text/plain`       | 静态文本  | 固定 URI + 固定内容，最简形式                 |
| `data://users`                    | `application/json` | 静态 JSON | 声明 mimeType 后 Client 可直接解析            |
| `data://users/{userId}`           | `application/json` | URI 模板  | `ResourceTemplate` + `list` / `complete` 回调 |
| `assets://avatar-placeholder.png` | `image/png`        | 二进制    | 内容放 `blob`（base64）而非 `text`            |

URI 模板资源用 `ResourceTemplate` 注册，两个回调都不能省：`list` 把模板展开成 `data://users/001` 这类具体 URI，不提供的话 Client 在 `resources/list` 里看不到它们，只能从 `resources/templates/list` 拿到模板本体；`complete` 为 URI 变量提供自动补全（输入 `0` 提示 `001/002/003`）。静态 URI 与模板 URI 重叠时，`resources/read` 的匹配顺序是精确 URI 优先、再试模板。

两个原语在协议层的差异：

| 维度       | Tool                                   | Resource                                                       |
| ---------- | -------------------------------------- | -------------------------------------------------------------- |
| JSON-RPC   | `tools/list`、`tools/call`             | `resources/list`、`resources/templates/list`、`resources/read` |
| 寻址方式   | 工具名 + 参数对象（Zod → JSON Schema） | URI（可含 `{变量}`），无参数 Schema                            |
| 谁决定调用 | 模型自主决定（model-controlled）       | 宿主应用决定（application-controlled）                         |
| 返回结构   | `content[]` + `isError`                | `contents[]`，每项含 `text` 或 `blob`                          |
| 错误表达   | 返回错误文本，交给模型重试             | 抛异常，协议层转为 JSON-RPC error（`-32603`）                  |
| 语义约定   | 允许副作用，靠 `annotations` 标注      | 只读、幂等、可缓存、可订阅变更                                 |

这个差异直接决定了客户端接法。`langchain-mcp-test.mjs` 用 `MultiServerMCPClient` 连本 Server：`getTools()` 只能拿到 Tool 并交给 `bindTools`，Resource 必须显式 `listResources()` + `readResource()` 后手动写入 SystemMessage——因为它本来就不归模型自主调用。拼接时有两个细节：只有 `blob` 的二进制资源需跳过；只注入 `docs://` 文档类资源，如果把 `data://users` 也塞进上下文，模型手里已有数据就不会再调 Tool 了。

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

- `查询用户 001 的信息` → 模型自动选中 `query_user`
- `有哪些用户` → 模型自动选中 `list_users`
- `查询用户 999 的信息` → 返回文本错误提示，而非 JSON-RPC error
- 手动挂载 `docs://guide` / `data://users` / `data://users/002` → 对比三种资源的返回体，注意这一步由客户端主动发起，模型不会自己去读

也可以直接跑 LangChain 侧的客户端，一次看完“读 Resource → 写入 SystemMessage → 模型调 Tool”的完整链路：

```bash
pnpm dev src/demo/langchain-mcp-test.mjs
```

⬅️ [ReAct 循环](./01-agent-basic.md) ｜ [📚 目录](../../README.md#目录) ｜ [多 MCP Server ➡️](./03-multi-mcp.md)
