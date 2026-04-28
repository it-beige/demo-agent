# 第 1 章：Agent 基础示例

> 模型调用本地工具（读/写文件、执行命令）完成任务，最终自动生成一个 React Todo 应用。

---

## 📖 章节简介

- **文件**：`src/demo/agent-react-todo.mjs`, `src/tools/*`
- **内容**：模型调用本地工具（读/写文件、执行命令）完成任务
- **产物**：自动生成 React Todo 应用

---

## 📁 涉及文件

### Agent 示例

- `src/demo/agent-react-todo.mjs`：示例任务描述
- `src/tools/*`：本地工具实现（读/写文件、列目录、执行命令）

> 💡 关于 Agent 内置的 4 个工具的详细说明，参见 [核心概念 - Agent 内置工具说明](./../concepts.md#-agent-内置工具说明)。

---

## 🚀 如何运行

执行：

```bash
node agent-react-todo.mjs
```

它会调用 `src/agent-react-todo.mjs` 中的中文任务描述，让模型尝试完成下面这些事：

- 创建一个 React + TypeScript + Vite 项目
- 实现 TodoList 的增删改查、筛选和统计
- 添加样式与动画
- 安装依赖并启动开发服务器

> 💡 运行结束后可查看 `react-todo-app/` 目录下的产物。详见 [核心概念 - react-todo-app 说明](./../concepts.md#-react-todo-app-说明)。

---

## ✏️ 动手练习

> 关于 Agent 内置工具的拓展练习，可以参考 [练习 - MCP 相关练习](./../exercises.md#-mcp-相关练习)中的"对照 `src/tool-runner.mjs` 思考 Agent 与 MCP 的本质差异"。

进阶后建议：

1. 改写任务描述，让 Agent 生成 Vue / Svelte 项目
2. 给工具增加超时和错误处理，观察 Agent 的恢复策略
3. 增加日志记录，观察每轮模型决策

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| —         | [章节目录](./../../README.md#-章节目录) | [第 2 章 MCP Server 基础](./02-mcp-server-basic.md) |
