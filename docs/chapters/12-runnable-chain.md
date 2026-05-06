# [Runnable] 声明式 Chain 组装：Sequence、Map、Branch、重试、降级

> 将命令式的"调模型→解析→输出"改造为声明式 Chain，获得可复用、可组合、可观测的工程化能力。
> **关键词**：RunnableSequence、.pipe()、RunnableMap、RunnableBranch、.withRetry、.withFallbacks

## 核心设计

传统方式写 AI 调用是"命令式三件套"：组装 prompt → 调模型 → 解析结果，代码一长就变成意大利面条。LangChain 的 Runnable 体系提供声明式替代方案：

- **基础串联**：`RunnableSequence` + `.pipe()` 链式调用，数据流向一目了然
- **并行执行**：`RunnableMap` 同时跑多个任务，结果自动合并
- **条件分支**：`RunnableBranch` 根据条件选择不同处理路径，`RouterRunnable` 按 key 路由
- **数据流控制**：`RunnablePassthrough` 直通/赋值，`RunnablePick` 挑字段，`RunnableEach` 遍历数组
- **自定义逻辑**：`RunnableLambda` 把任意函数包装进链

高级特性：`.withRetry()` 失败自动重试（`onFailedAttempt` 回调可观测每次失败原因），`.withFallbacks()` 多级降级依次尝试，`.withConfig()` 动态传递业务配置，`RunnableWithMessageHistory` 多轮对话记忆。

## 运行方式

```bash
# 传统 vs Runnable 对比
pnpm dev src/runnable/before.mjs
pnpm dev src/runnable/runnable.mjs

# 核心 API
pnpm dev src/runnable/api-case/RunnableLambda.mjs
pnpm dev src/runnable/api-case/RunnableMap.mjs
pnpm dev src/runnable/api-case/RunnableBranch.mjs
pnpm dev src/runnable/api-case/RunnableRoute.mjs
pnpm dev src/runnable/api-case/RunnablePassthrough.mjs
pnpm dev src/runnable/api-case/RunnableEach.mjs
pnpm dev src/runnable/api-case/RunnablePick.mjs

# 高级特性
pnpm dev src/runnable/api-case/RunnableWithRetry.mjs
pnpm dev src/runnable/api-case/RunnableWithFallbacks.mjs
pnpm dev src/runnable/api-case/RunnableWithConfig.mjs
pnpm dev src/runnable/api-case/RunnableWithMessageHistory.mjs
pnpm dev src/runnable/api-case/RunnableWithCallbacks.mjs
```

## 扩展方向

- 将 Runnable 链与 NestJS 服务集成，作为可复用的 AI 中间件
- 实现自定义 Chain 类，封装业务特有的重试和降级逻辑
- 结合 callbacks 做全链路可观测性（记录每步耗时、token 消耗、错误信息）

---
⬅️ [提示词组件化](./11-prompt-template.md) ｜ [📚 目录](../../README.md#目录) ｜ [Nest SSE 流式 ➡️](./13-nest-langchain-sse.md)