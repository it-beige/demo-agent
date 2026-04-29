# 第 18 章：图形编排引擎：LangGraph 和多 Agent 架构

> 用图（Graph）来编排 AI 工作流：节点 = 处理函数、边 = 流转规则、状态 = 全图共享数据。核心问题：**如何把复杂的多步流程、条件分支、循环重试、人工干预、多 Agent 协作，统一在一张可视化的图里组织起来。**

---

## 📖 章节简介

- **目录**：`src/langgraph/` 完整 LangGraph 学习子项目
- **内容**：从最简单的线性图，到条件路由、循环重试、检查点、人工干预、预置 ToolNode/Agent，再到多 Agent Supervisor 调度的完整演进
  - **基础图结构**：`StateGraph` + `Annotation` 定义状态、节点、边、`START` / `END`、Mermaid 流程图导出
  - **条件路由**：`addConditionalEdges` 根据状态动态选择下一节点（数学计算 vs 普通对话）
  - **循环重试**：节点指回自己 + `recursionLimit` 控制最大循环次数
  - **检查点 / 多会话**：`MemorySaver` + `thread_id` 实现持久化与会话隔离
  - **人工干预（HITL）**：`interrupt()` 暂停图执行、等用户输入后用 `Command` 恢复
  - **工具调用集成**：`MessagesAnnotation` + 预置 `ToolNode` + `toolsCondition`
  - **封装版 Agent**：langchain 包的 `createAgent` 一行搞定 ReAct Agent
  - **多 Agent 协作**：`createSupervisor` 主管模式，根据问题类型切换子代理
- **重点**：声明式工作流编排、可视化（Mermaid）流程图、状态管理范式、多 Agent 系统设计
- **核心问题**：如何把复杂的多步流程、条件分支、循环重试、人工干预、多 Agent 协作，统一在一张可视化的图里组织起来

---

## 📁 涉及文件

### 基础图结构（1 个文件）

- `src/langgraph/src/basic-graph.mjs`：`StateGraph` + `Annotation.Root` 定义最简单的线性流（step1 → step2 → step3），并打印 Mermaid 流程图

### 条件路由（1 个文件）

- `src/langgraph/src/conditional-routing.mjs`：`addConditionalEdges` 演示，router 节点判断是数学表达式还是普通对话，分别走 `math` 或 `chat` 节点

### 循环与重试（1 个文件）

- `src/langgraph/src/loop-retry.mjs`：节点边指回自己实现"重试直到成功"，并通过 `compile({ recursionLimit })` 设置最大循环次数

### 检查点与会话隔离（1 个文件）

- `src/langgraph/src/checkpointer-memory.mjs`：`MemorySaver` + `thread_id` 让"同一图、不同用户"各有独立访问计数；演示 `checkpointer.get` / `checkpointer.list` 读取检查点

### 人工干预 / HITL（1 个文件）

- `src/langgraph/src/graph-interrupt.mjs`：`interrupt()` 暂停转账图、等用户终端输入"确认"后恢复执行（必须配合 `MemorySaver`）

### 工具调用集成（1 个文件）

- `src/langgraph/src/prebuilt-tool-node.mjs`：`MessagesAnnotation` + 预置 `ToolNode` + `toolsCondition`，实现 agent ↔ tools 自动循环（查询商品库存）

### 封装版 Agent（1 个文件）

- `src/langgraph/src/prebuilt-agent.mjs`：使用 langchain 包的 `createAgent` 一行构建带工具 + checkpointer 的 ReAct Agent

### 多 Agent Supervisor（1 个文件）

- `src/langgraph/src/multi-agent-supervisor.mjs`：`@langchain/langgraph-supervisor` 的 `createSupervisor` 演示，主管根据"天气/小知识"调度 `weather_agent` 或 `trivia_agent` 子代理

### 假数据 Mock（2 个文件）

- `src/langgraph/src/inventory-mock.mjs`：商品库存 Mock（`getProductBySku`），供 `prebuilt-tool-node.mjs` 与 `prebuilt-agent.mjs` 使用
- `src/langgraph/src/simple-mock.mjs`：天气 + 城市小知识 Mock（`lookupWeather` / `lookupCityTrivia`），供 `multi-agent-supervisor.mjs` 使用

### 共享配置（2 个文件）

- `src/langgraph/utils/model.mjs`：共享 ChatModel 实例（被多个示例 import）
- `src/langgraph/utils/config.util.mjs`：环境变量读取工具

---

## 🚀 如何运行

> ⚠️ **前置条件**：
>
> - 涉及大模型调用的示例（第 6/7/8 个）需要在根目录 `.env` 中配置 `MODEL`、`API_KEY`、`BASE_URL`
> - 子项目依赖通过根 workspace 提供，无需额外 `pnpm install`

### 1️⃣ 基础图结构

```bash
node src/langgraph/src/basic-graph.mjs
```

这个示例会：

- 用 `Annotation.Root` 定义带 `text` 字段的状态
- 串联 step1 → step2 → step3 三个节点（每步给 `text` 拼接处理痕迹）
- 打印整张图的 Mermaid 流程图（可贴到 <https://mermaid.live> 或 Markdown 的 ` ```mermaid ` 代码块查看）
- 输出最终 state

---

### 2️⃣ 条件路由

```bash
node src/langgraph/src/conditional-routing.mjs
```

这个示例会：

- 定义 `router` 节点根据 `query` 是否含 `+ - * /` 决定走 `math` 还是 `chat` 分支
- `math` 节点用 `mathjs` 计算表达式；`chat` 节点回声式回答
- 演示 `addConditionalEdges('router', state => state.route, { math: 'math', chat: 'chat' })`
- 跑两次 invoke：一次"你好"走 chat，一次"10 \* 8"走 math

---

### 3️⃣ 循环与重试

```bash
node src/langgraph/src/loop-retry.mjs
```

这个示例会：

- `attempt` 节点每次累计 `tries`，第 3 次成功
- 用 `addConditionalEdges` 把"未成功"分支指回 `attempt` 节点形成循环
- 在 `compile({ recursionLimit: 100 })` 中设置最大循环深度
- 输出三轮失败后第 3 次成功的最终状态

---

### 4️⃣ 检查点与会话隔离

```bash
node src/langgraph/src/checkpointer-memory.mjs
```

这个示例会：

- 用 `MemorySaver` 作为 checkpointer
- 用两个不同 `thread_id`（小张 / 小李）模拟两个用户独立计数
- 小张连续 invoke 三次 → `visitCount` 变成 3；小李第一次 invoke → `visitCount` 是 1，互不干扰
- 演示 `checkpointer.get` / `checkpointer.list` 读取已保存的快照

---

### 5️⃣ 人工干预 / HITL

```bash
node src/langgraph/src/graph-interrupt.mjs
```

这个示例会：

- `showTransfer` 节点准备一笔模拟转账信息
- `waitConfirm` 节点调用 `interrupt({ ... })` 暂停整张图，等待用户输入
- 终端会提示你输入"确认"或备注，按回车后图用 `Command({ resume: ... })` 恢复
- 必须配合 `MemorySaver` 才能保存中断点继续执行

> 💡 这是 Human-in-the-Loop（人在回路）模式的最小演示，常用于敏感操作（转账、删除、发布）的二次确认。

---

### 6️⃣ 工具调用集成（手写图 + ToolNode）

```bash
node src/langgraph/src/prebuilt-tool-node.mjs
```

这个示例会：

- 用 `MessagesAnnotation`（消息列表内置 reducer）作为状态
- `agent` 节点调用 `model.bindTools([...])`，让模型决定是否要调工具
- 预置 `ToolNode` 自动执行工具调用并把结果以 `ToolMessage` 写回状态
- `addConditionalEdges('agent', toolsCondition, ['tools', END])` 用预置 `toolsCondition` 决定继续调工具还是结束
- 工具是 `get_product_stock`（查 SKU 库存，使用 `inventory-mock.mjs`）

---

### 7️⃣ 封装版 Agent（`createAgent`）

```bash
node src/langgraph/src/prebuilt-agent.mjs
```

这个示例会：

- 使用 langchain 包顶层导出的 `createAgent({ model, tools, systemPrompt, checkpointer })` 一行构建 ReAct Agent
- 自动包含 agent ↔ tools ↔ END 的图结构 + `MemorySaver` 检查点
- 通过 `agent.graph.getGraphAsync()` 拿到内部图并打印 Mermaid
- 用 `thread_id: 'demo-thread'` 调用，自动使用 checkpointer

> 💡 与第 6 个示例对比：`createAgent` 是"高度封装版"，适合快速上手；手写 `StateGraph` 适合需要精细控制流程的场景。

---

### 8️⃣ 多 Agent Supervisor

```bash
node src/langgraph/src/multi-agent-supervisor.mjs
```

这个示例会：

- 用 `createAgent` 构建两个专精子代理：
  - `weather_agent`：只用 `lookup_weather` 工具回答天气
  - `trivia_agent`：只用 `lookup_city_trivia` 工具讲城市小知识
- 用 `@langchain/langgraph-supervisor` 的 `createSupervisor` 构建主管：
  - 主管自身不调用业务工具，只根据用户问题选择哪个子代理
  - 通过 prompt 明确划定职责边界（"天气/气温/下雨 → weather_agent"，"小知识/名胜/历史 → trivia_agent"）
- 用 `app.stream(input, { streamMode: ['updates', 'values'] })` 流式执行，记录被调度过的节点路径
- 测试输入："查一下杭州的天气，再讲一条和杭州有关的小知识。" → 主管会依次调度两个子代理

> 💡 这是构建复杂 AI 系统的关键模式：**单 Agent 太杂会失焦，拆成多个职责单一的子 Agent + 一个 Supervisor 调度**，更好维护、更易扩展。

---

## 🎨 Mermaid 流程图导出

本章每个示例都会用 `graph.getGraphAsync()` + `drawable.drawMermaid({ withStyles: true })` 打印整张图的 Mermaid 源码。可以：

- 复制粘贴到 <https://mermaid.live> 在线渲染
- 粘贴到 Markdown 的 ` ```mermaid ` 代码块（GitHub 原生支持渲染）
- 用于团队评审复杂图结构时直观沟通

---

## ✏️ 动手练习

详见 [建议动手练习 - LangGraph 与多 Agent 架构练习](./../exercises.md#-langgraph-与多-agent-架构练习)。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 17 章 Nest + 腾讯云 TTS/ASR 实现实时语音助手](./17-nest-tts-asr.md) | [章节目录](./../../README.md#-章节目录) | — |
