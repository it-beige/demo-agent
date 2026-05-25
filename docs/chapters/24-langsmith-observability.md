# [Observability] LangSmith 全链路观测：从 Agent 调试到 RAG 量化评估

## 核心设计

基于 LangSmith 平台为 LangChain / LangGraph 应用提供从开发调试到生产评测的全链路可观测能力。

**Tracing（链路追踪）**：只需三个环境变量（`LANGCHAIN_TRACING_V2=true`、`LANGCHAIN_API_KEY`、`LANGCHAIN_PROJECT`），LangChain 的所有 Runnable 调用、Tool 执行、Retriever 检索、LLM 推理都会自动上报到 LangSmith，无需修改业务代码。

**Evaluation（量化评测）**：借助 `langsmith/evaluation` 框架和 `openevals` 内置指标，对 RAG Agent 跑自动化回归实验，从三个维度量化系统质量：忠实度（Groundedness）、有用性（Helpfulness）、检索相关性（Retrieval Relevance）。

| 能力         | 说明                                                     |
| ------------ | -------------------------------------------------------- |
| 链路追踪     | LangChain callback 自动上报，零侵入接入                  |
| Run 树可视化 | 在 LangSmith UI 查看每一步输入/输出/耗时/Token 消耗      |
| 数据集管理   | 通过 `langsmith.Client` API 创建和管理评测样例           |
| LLM-as-Judge | 用大模型本身做评估，`openevals` 提供标准 RAG 评测 Prompt |
| 实验对比     | 同一数据集多次实验，横向对比不同 Prompt / 模型的效果差异 |

## 模块结构

```
src/smith-langchian/
├── data/                       # RAG 知识库原始文档（.md/.txt）
├── src/
│   ├── milvus_insert.mjs       # 向量化入库：文档切块 → Embedding → Milvus
│   ├── rag_agent.mjs           # RAG Agent：LangGraph 检索→生成两节点图
│   ├── cli.mjs                 # CLI 交互：批量测试问题并打印引用片段
│   └── eval/
│       ├── build_dataset.mjs   # 构建评测数据集（12 条 QA 样例 → LangSmith）
│       ├── evaluators.mjs      # 三个 LLM-as-Judge 评估器（openevals 指标）
│       └── run_eval.mjs        # 评测入口：跑实验并上报 LangSmith
├── utils/
│   └── model.mjs               # 模型配置：ChatOpenAI + OpenAIEmbeddings
└── docker-compose.yml          # Milvus（etcd + MinIO + standalone）
```

## 全链路追踪原理

LangChain v0.2+ 内置了 LangSmith callback handler。当环境变量 `LANGCHAIN_TRACING_V2=true` 时，每次 `invoke()` 调用都会自动构建一棵 **Run 树**：

```
Run: rag_agent (chain)
├── Run: retrieve (retriever)
│   └── Milvus similarity_search → 4 docs
└── Run: generate (chain)
    ├── Run: ChatPromptTemplate (prompt)
    └── Run: ChatOpenAI (llm)
        └── Token usage: prompt=512, completion=128
```

这棵树会被序列化为 JSON 上报到 `https://api.smith.langchain.com`，可在 LangSmith UI 的 **Projects → {project_name}** 页面查看每次运行的完整链路、耗时分布和 Token 消耗。

> **注意**：本项目使用 `LANGCHAIN_SMITH_*` 前缀的环境变量（与 LangChain 官方 `LANGCHAIN_*` 区分），在 `run_eval.mjs` 中手动传入 `Client({ apiKey: process.env.LANGCHAIN_SMITH_API_KEY })` 完成鉴权。

## RAG 评测体系

### 评测流程

```
build_dataset.mjs         run_eval.mjs              LangSmith UI
     │                         │                         │
     │ createExamples()        │ evaluate()              │
     └──► LangSmith ──────────►│                         │
          Dataset              │                         │
          (12条QA)             │ runRagAgent()           │
                               │ × 12 条 × 3 评估器      │
                               └────────────────────────►│
                                                         │
                                          实验报告：三维度得分
```

### 三大 RAG 指标（OpenEvals）

| 指标                      | 评估对象               | 核心问题                         |
| ------------------------- | ---------------------- | -------------------------------- |
| `rag_groundedness`        | 答案 vs 检索上下文     | 答案是否有上下文支撑，有无幻觉？ |
| `rag_helpfulness`         | 答案 vs 用户问题       | 答案是否切题，是否答非所问？     |
| `rag_retrieval_relevance` | 检索上下文 vs 用户问题 | 召回的文档片段和问题是否相关？   |

每个指标通过 `createLLMAsJudge()` 创建，底层使用同一个大模型（Judge LLM）按 `openevals` 预设的评测 Prompt 打分，返回 0~1 的连续分数（`continuous: true`）。

### 数据集构建（build_dataset.mjs）

评测数据集包含 12 条覆盖客服场景的 QA 样例（退货、物流、支付、会员、保修等），通过 `langsmith.Client.createExamples()` 批量写入 LangSmith 的 `rag-eval-v1` 数据集。

```js
const EXAMPLES = [
  {
    inputs: { question: '无理由退货要在几天内申请？' },
    outputs: { answer: '自签收之日起 7 天内支持无理由退货。' },
  },
  // ... 共 12 条
]
```

### 评测执行（run_eval.mjs）

```js
const result = await evaluate(runRagAgent, {
  data: DATASET_NAME, // 数据集名称
  evaluators: ragEvaluators, // 三个评估器数组
  client, // LangSmith Client
  experimentPrefix: `rag-openevals-${MODEL}`,
  maxConcurrency: 2, // 并发数，避免 API 限流
})
```

`evaluate()` 会对数据集中每条样例：① 调用 `runRagAgent(inputs)` 得到 `{ answer, context }` → ② 并行执行三个评估器 → ③ 将分数和评论上报 LangSmith。

### 结果查看

评测完成后，在 [LangSmith](https://smith.langchain.com) → 对应 Project → **Experiments** 页面查看：

- 每条样例的三维度得分（0~1）
- 汇总平均分，支持多实验横向对比
- 点击单条样例可查看 Run 详情（检索到的文档片段、生成的答案、Judge LLM 的评分理由）

## 运行方式

```bash
cd src/smith-langchian

# 1. 启动 Milvus（arm64 兼容）
docker compose up -d

# 2. 导入知识库文档到 Milvus
pnpm dev src/smith-langchian/src/milvus_insert.mjs

# 3. 测试 RAG Agent（CLI 交互）
pnpm dev src/smith-langchian/src/cli.mjs

# 4. 构建评测数据集（首次运行）
pnpm dev src/smith-langchian/src/eval/build_dataset.mjs

# 5. 运行 RAG 评测实验
pnpm dev src/smith-langchian/src/eval/run_eval.mjs
```

> 运行前确保 `.env` 中已配置 `LANGCHAIN_SMITH_API_KEY` 和 `LANGCHAIN_SMITH_PROJECT`。

## 扩展方向

- **A/B 实验**：对比不同 Embedding 模型（`text-embedding-v3` vs `bge-large`）或不同 Prompt 模板对 RAG 三维度指标的影响
- **在线评测**：将 `evaluate()` 集成到 CI/CD，每次 Prompt 变更自动触发回归实验，分数低于阈值阻断发布
- **Trace 分析**：基于 LangSmith Tracing 数据分析 P99 延迟、Token 消耗趋势，定位慢查询和高成本节点
- **Human-in-the-loop 评估**：在 LangSmith UI 中人工标注答案质量，构建更贴合业务的 Ground Truth 数据集

---

⬅️ [ElasticSearch 全文检索](./21-elasticsearch-fulltext.md) ｜ [📚 目录](../../README.md#目录) ｜ [DeepAgents Middleware ➡️](./25-deepagents-middleware.md)
