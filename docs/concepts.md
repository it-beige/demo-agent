# 🧠 核心概念

> 本文档汇集贯穿全仓库的几个基础概念：Agent 的内置工具、Agent vs MCP 的区分、以及 `react-todo-app/` 这个产物的说明。

---

## 🛠️ Agent 内置工具说明

当前 Agent 示例挂载了 4 个本地工具：

| 工具              | 功能                              |
| ----------------- | --------------------------------- |
| `file-read`       | 读取文件内容                      |
| `file-write`      | 写入文件，自动创建目录            |
| `directory-list`  | 列出目录内容                      |
| `command-execute` | 执行系统命令，可指定 `workingDirectory` |

其中 `command-execute` 的设计重点是：**目录切换通过 `workingDirectory` 控制**，而不是在命令字符串里手动写 `cd xxx && ...`。

> 💡 这也是一个很适合学习的点：提示词设计会直接影响 Agent 是否能稳定调用工具。

---

## 🔀 Agent 和 MCP 怎么区分

可以先用一个很粗的理解方式：

| 形态    | 含义                                                       |
| ------- | ---------------------------------------------------------- |
| `Agent` | 你在应用内部主动把工具交给模型，模型在一次任务流程里自主决策怎么调用 |
| `MCP`   | 你把能力做成标准服务，由外部 MCP Client 接入、发现和调度   |

这个仓库把两种方式都放在一起，正好适合对比学习：

- 如果你想理解"模型如何在多轮中调用本地工具"，先看 Agent（[第 1 章 Agent 基础](./chapters/01-agent-basic.md)）
- 如果你想理解"能力如何以协议形式提供给外部客户端"，先看 MCP Server（[第 2 章 MCP Server 基础](./chapters/02-mcp-server-basic.md)）

两条路线都在做"给模型能力"，但抽象层级和接入位置不一样。

再往前走一步可以这样理解：

- **MCP Server**：暴露能力
- **MCP Client**：发现并连接这些能力
- **Agent**：拿到这些能力后，决定什么时候用、怎么组合使用

`src/mcp-amap.mjs`（[第 3 章](./chapters/03-multi-mcp.md)）就是一个很直接的例子：它自己不是工具提供方，而是"工具使用方"。

---

## 📦 react-todo-app 说明

`react-todo-app/` 是当前仓库自带的示例产物，方便你直接查看 Agent 最终生成了什么。它当前包含：

- 添加、删除、编辑待办事项
- 完成状态切换
- 按全部 / 进行中 / 已完成筛选
- 任务统计
- 基于 `localStorage` 的本地持久化
- 基础界面样式和过渡动画

如果你想单独启动它：

```bash
cd react-todo-app
pnpm install
pnpm dev
```

> 💡 `react-todo-app/README.md` 仍然是 Vite 默认内容，阅读这个仓库时优先看根目录 `README.md` 即可。

---

## ➡️ 下一步

- 📚 回到 [章节目录](./../README.md#-章节目录)
- 🗺️ 查看 [推荐学习顺序](./learning-path.md)
