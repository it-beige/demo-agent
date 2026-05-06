# [RAG·Agentic] 基于 LangGraph 实现自主决策的 RAG 闭环

> 4 个递进式 RAG demo：朴素检索→查询路由→子问题拆解+多跳检索→联网兜底，逐步把决策权从硬编码规则交给模型自主判断。
> **关键词**：查询路由、子问题拆解、多跳检索、规划决策、联网兜底、LangGraph

## 核心设计

Agentic RAG 是传统 RAG 的进化：不再只是"检索→生成"两步流水线，而是让模型在检索链路中拥有自主决策能力。4 个示例以《天龙八部》小说问答为场景，Milvus 向量库 + LangGraph 编排：

| # | 文件 | 新增决策点 | 核心机制 |
|---|------|-----------|----------|
| 1 | `naive-rag.mjs` | （无） | 检索 → 生成，最简两节点 LangGraph |
| 2 | `rag-query-router.mjs` | 是否检索 | `withStructuredOutput` 输出 simple/complex 路由 |
| 3 | `rag-multihop.mjs` | 怎么检索 + 何时停止 | 子问题拆解 + 多轮循环 + `plan_next_step` 自主决策 |
| 4 | `rag-webfallback.mjs` | 检索不够怎么办 | 充分性评估 → Tavily 联网兜底 → 二次评估 |

核心设计原则：**把决策权交给模型，但不放任**——每个决策点都有硬性上限（`maxRetrievals`、剩余子问题数、联网只触发一次）。节点可复用（`evaluate_local` 在本地检索和联网搜索后共用），状态统一通过 `Annotation.Root` 定义并贯穿全图。

## 运行方式

```bash
# 基础 RAG
pnpm dev src/advanced-rag/src/naive-rag.mjs

# 查询路由
pnpm dev src/advanced-rag/src/rag-query-router.mjs

# 多跳 RAG（子问题拆解 + 多轮检索 + 自主规划）
pnpm dev src/advanced-rag/src/rag-multihop.mjs

# 联网兜底（需配 TAVILY_API_KEY）
pnpm dev src/advanced-rag/src/rag-webfallback.mjs
```

需配置 `.env`：`MODEL`/`API_KEY`/`BASE_URL` + Embedding + Milvus，联网兜底额外需要 `TAVILY_API_KEY`。每个示例启动时会打印 Mermaid 图结构，可复制到 [mermaid.live](https://mermaid.live) 可视化。

## 扩展方向

- 在 `plan_next_step` 中引入检索质量评分，低分自动二次检索或切换策略
- 将联网搜索替换为其他外部工具（数据库查询、API 调用）
- 结合 Runnable 链，将检索策略做成可插拔的 Strategy 模式

---
⬅️ [LangGraph 多 Agent](./18-langgraph-multi-agent.md) ｜ [📚 目录](../../README.md#目录) ｜ ➡️