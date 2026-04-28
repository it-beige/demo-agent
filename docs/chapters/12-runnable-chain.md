# 第 12 章：Runnable - 把写逻辑变成组装 Chain

> 从传统方式到 Runnable 组装的完整演进路径。核心问题：**如何将命令式代码转变为声明式 Chain，提升可维护性和可复用性。**

---

## 📖 章节简介

- **文件**：`src/runnable/` 目录下的示例代码
- **内容**：从传统方式到 Runnable 组装的完整演进路径
  - **传统方式对比**：手动串联 Prompt → Model → OutputParser 的 3 步流程
  - **Runnable 基础**：`RunnableSequence` 串行执行、`.pipe()` 链式调用
  - **自定义逻辑**：`RunnableLambda` 包装自定义函数
  - **并行执行**：`RunnableMap` 同时执行多个任务、结果合并
  - **条件分支**：`RunnableBranch` 根据条件动态选择处理路径
  - **键值路由**：`RouterRunnable` 显式指定 key 选择处理器
  - **数组遍历**：`RunnableEach` 对数组每个元素应用相同处理
  - **数据流管理**：`RunnablePassthrough` 直通/赋值、`RunnablePick` 字段选择
  - **高级特性**：
    - **重试机制**：`.withRetry()` 失败自动重试（`onFailedAttempt` 回调、最大尝试次数）
    - **降级机制**：`.withFallbacks()` 备选方案依次尝试
    - **回调监听**：`callbacks` 监控链执行（Start/End/Error）
    - **配置传递**：`.withConfig()` 动态传递统一配置（`configurable` 业务配置）
    - **对话历史**：`RunnableWithMessageHistory` 多轮对话记忆管理
- **重点**：声明式组装、数据流控制、高级特性组合、生产级最佳实践
- **核心问题**：如何将命令式代码转变为声明式 Chain，提升可维护性和可复用性

---

## 📁 涉及文件

### 基础对比（1 个文件）

- `src/runnable/before.mjs`：传统方式手动串联 Prompt → Model → OutputParser

### Runnable 基础（1 个文件）

- `src/runnable/runnable.mjs`：`RunnableSequence` 串行执行、`.pipe()` 链式调用

### 核心 API（7 个文件）

| 文件 | 作用 |
| ---- | ---- |
| `src/runnable/api-case/RunnableLambda.mjs` | 包装自定义函数 |
| `src/runnable/api-case/RunnableMap.mjs` | 并行执行多个任务 |
| `src/runnable/api-case/RunnableBranch.mjs` | 条件分支路由 |
| `src/runnable/api-case/RunnableRoute.mjs` | `RouterRunnable` 键值路由 |
| `src/runnable/api-case/RunnablePassthrough.mjs` | 数据直通/赋值 |
| `src/runnable/api-case/RunnableEach.mjs` | 数组遍历处理 |
| `src/runnable/api-case/RunnablePick.mjs` | 字段选择提取 |

### 高级特性（5 个文件）

| 文件 | 作用 |
| ---- | ---- |
| `src/runnable/api-case/RunnableWithRetry.mjs` | 失败自动重试（`onFailedAttempt` 回调） |
| `src/runnable/api-case/RunnableWithFallbacks.mjs` | 备选方案降级机制 |
| `src/runnable/api-case/RunnableWithConfig.mjs` | 配置传递（`configurable` 业务配置） |
| `src/runnable/api-case/RunnableWithMessageHistory.mjs` | 多轮对话记忆管理 |
| `src/runnable/api-case/RunnableWithCallbacks.mjs` | 回调监听链执行 |

---

## 🚀 如何运行

> 💡 源 README 未为本章单独提供运行说明。各示例文件可直接通过 `node` 运行，建议按下方"涉及文件"分组顺序依次执行：
>
> ```bash
> # 传统方式 vs Runnable 对比
> node src/runnable/before.mjs
> node src/runnable/runnable.mjs
>
> # 核心 API
> node src/runnable/api-case/RunnableLambda.mjs
> node src/runnable/api-case/RunnableMap.mjs
> node src/runnable/api-case/RunnableBranch.mjs
> node src/runnable/api-case/RunnableRoute.mjs
> node src/runnable/api-case/RunnablePassthrough.mjs
> node src/runnable/api-case/RunnableEach.mjs
> node src/runnable/api-case/RunnablePick.mjs
>
> # 高级特性
> node src/runnable/api-case/RunnableWithRetry.mjs
> node src/runnable/api-case/RunnableWithFallbacks.mjs
> node src/runnable/api-case/RunnableWithConfig.mjs
> node src/runnable/api-case/RunnableWithMessageHistory.mjs
> node src/runnable/api-case/RunnableWithCallbacks.mjs
> ```

---

## ✏️ 动手练习

> 💡 源 README 未为本章单独列出动手练习。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 11 章 PromptTemplate 组件化管理](./11-prompt-template.md) | [章节目录](./../../README.md#-章节目录) | [第 13 章 Nest + LangChain 实现基于 SSE 的流式 AI 接口](./13-nest-langchain-sse.md) |
