# [Agent] ReAct 循环与本地工具调用

> 模型通过 ReAct 循环（推理→行动→观察）自主调用本地工具，从零生成一个完整的 React Todo 应用。
> **关键词**：ReAct 循环、工具调用、文件读写、命令执行

## 核心设计

这个 demo 演示了 Agent 最核心的闭环：给模型一个自然语言任务描述，它通过 `while(true)` 循环反复执行"思考需要什么信息 → 调用对应工具 → 观察结果 → 继续思考"，直到任务完成。

内置 4 个本地工具：`file-read`、`file-write`、`directory-list`、`command-execute`。其中 `command-execute` 通过 `workingDirectory` 参数控制执行目录，而非在命令字符串里手动 `cd`——这样做能让模型更稳定地定位到目标目录。

任务描述是中文的自然语句（"创建一个 React Todo 应用..."），模型需要自己理解任务目标、规划步骤、选择工具。最终产物 `react-todo-app/` 包含增删改查、筛选统计、localStorage 持久化和基础动画。

## 扩展方向

- 改写任务描述，让 Agent 生成 Vue/Svelte 项目，观察它是否能自适应不同技术栈
- 给工具加上超时和重试逻辑，观察 Agent 在工具失败时的恢复策略
- 增加日志持久化，分析多轮调用中模型的决策质量

⬅️ ｜ [📚 目录](../../README.md#目录) ｜ [MCP Server 基础 ➡️](./02-mcp-server-basic.md)