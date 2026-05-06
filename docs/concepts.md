# 核心概念

> 贯穿全仓库的基础概念：Agent 内置工具、Agent vs MCP 区分、react-todo-app 产物说明。

## Agent 内置工具

当前 Agent 示例挂载了 4 个本地工具：

| 工具 | 功能 |
|------|------|
| `file-read` | 读取文件内容 |
| `file-write` | 写入文件，自动创建目录 |
| `directory-list` | 列出目录内容 |
| `command-execute` | 执行 shell 命令，通过 `workingDirectory` 控制目录 |

`command-execute` 的设计要点：目录切换通过 `workingDirectory` 参数控制，而不是在命令字符串里写 `cd xxx && ...`——这直接取决于 prompt 设计的质量。

## Agent 和 MCP 怎么区分

| 形态 | 含义 |
|------|------|
| **Agent** | 在应用内部主动把工具交给模型，模型在任务流程里自主决策怎么调用 |
| **MCP** | 把能力做成标准服务，由外部 MCP Client 接入、发现和调度 |

- 想理解"模型如何在多轮中调用本地工具"→ 看 [Agent] 01
- 想理解"能力如何以协议形式提供给外部"→ 看 [MCP] 02
- `src/mcp-amap.mjs`（[MCP·Client] 03）不是工具提供方，而是"工具使用方"

MCP Server 暴露能力，MCP Client 发现并连接，Agent 拿到能力后决定什么时候用、怎么组合。

## react-todo-app 产物

`react-todo-app/` 是 Agent 自动生成的产物，包含：增删改待办、完成状态切换、按状态筛选、任务统计、localStorage 持久化、基础样式和过渡动画。

单独启动：

```bash
cd react-todo-app
pnpm install
pnpm dev
```

> 💡 `react-todo-app/README.md` 仍然是 Vite 默认内容，阅读这个仓库时优先看根目录 `README.md` 即可。

---

## ➡️ 下一步

- 📚 回到 [目录](./../README.md#目录)
- 🗺️ 查看 [推荐学习顺序](./learning-path.md)