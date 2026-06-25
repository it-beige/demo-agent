# DeepAgents 实战：多 Agent 架构的深度调研助手

> 基于 DeepAgents 的 `createDeepAgent` 构建多 Agent 协作系统：主 Agent 负责规划与协调，researcher/editor/analyst 三类子 Agent 各司其职，配合 Skills 技能注入、FilesystemBackend 文件沙箱和 Tavily 联网搜索，实现从用户提问到交付专业调研报告的完整闭环。
> **关键词**：createDeepAgent、SubAgent 委派、Skills 技能注入、FilesystemBackend、Tavily 联网搜索、调研报告自动生成

## 核心架构

```
用户输入调研主题
      │
      ▼
┌─────────────────────────────────────────┐
│           主 Agent（Orchestrator）        │
│  职责：规划、委派、起草报告、定稿        │
│  Skills：web-research / report-writer    │
└────────┬──────────┬───────────┬─────────┘
         │          │           │
         ▼          ▼           ▼
   ┌──────────┐ ┌────────┐ ┌──────────┐
   │researcher│ │analyst │ │  editor  │
   │联网调研  │ │数值分析│ │ 审阅反馈 │
   └──────────┘ └────────┘ └──────────┘
         │          │           │
         ▼          ▼           ▼
   findings_*.md  analysis_*.md  审阅意见
         │
         ▼
   /workspace/reports/report_*.md（最终交付）
```

## 多 Agent 角色分工

| 角色     | 名称         | 职责                                         | 工具                                      |
| -------- | ------------ | -------------------------------------------- | ----------------------------------------- |
| 主 Agent | orchestrator | 规划任务、委派调研员、亲自撰写报告、协调审阅 | write_file / edit_file / read_file / task |
| 调研员   | researcher   | 联网搜索单一子主题，输出结构化 findings      | web_search / write_file / write_todos     |
| 分析师   | analyst      | 数值计算与数据分析（eval REPL）              | eval / read_file / write_file             |
| 编辑     | editor       | 审阅报告草稿，提供修改建议                   | read_file                                 |

## 标准工作流

```
1. 规划 → write_todos 拆解 + 保存 question.txt + research_plan.md
2. 调研 → 并行委派 researcher（最多 3 个）→ findings_*.md
3. 分析 → 需要数值时委派 analyst → analysis_*.md
4. 起草 → 主 Agent 按 report-writer 技能撰写 → draft_*.md
5. 审阅 → 委派 editor 审稿 → 反馈意见
6. 定稿 → 根据反馈修订 → report_*_[日期].md
```

## 关键实现

### createDeepAgent — 高层 API

与第 25 章的 `createAgent` + Middleware 手动组装不同，`createDeepAgent` 是 DeepAgents 提供的**高层封装**，一次性声明 model、systemPrompt、backend、memory、skills、subagents：

```js
import { createDeepAgent, FilesystemBackend } from 'deepagents'

const backend = new FilesystemBackend({
  rootDir: projectDir,
  virtualMode: true, // 内存沙箱，不影响真实文件系统
})

const agent = createDeepAgent({
  model,
  systemPrompt: orchestratorPrompt,
  backend,
  memory: [path.join(projectDir, 'AGENTS.md')],
  skills: ['/skills/'],
  subagents: [researcherSubAgent, editorSubAgent, analystSubAgent],
})
```

### Skills 技能注入

通过 `skills: ['/skills/']` 自动加载项目下的 SKILL.md，为主 Agent 提供**流程指南**：

| 技能          | 文件                            | 作用                                       |
| ------------- | ------------------------------- | ------------------------------------------ |
| web-research  | `skills/web-research/SKILL.md`  | 指导主 Agent 如何规划调研、委派 researcher |
| report-writer | `skills/report-writer/SKILL.md` | 指导主 Agent 撰写结构化报告                |

> 技能是写作/流程指南，**不是**子 Agent——不要用 `task` 工具调用技能名。

### SubAgent 定义

每个子 Agent 通过对象声明 `name`、`description`、`systemPrompt`、`tools`，可选 `middleware`：

```js
const researcherSubAgent = {
  name: 'researcher',
  description: '通过联网搜索调研单一子主题',
  systemPrompt: `...`, // 严格约束搜索次数、输出格式
  tools: [webSearch],
}

const analystSubAgent = {
  name: 'analyst',
  description: '使用 eval REPL 进行数值计算与数据分析',
  systemPrompt: `...`,
  middleware: [createCodeInterpreterMiddleware()], // QuickJS 沙箱执行代码
}
```

### Tavily 联网搜索工具

使用 Tavily Search API 提供联网能力，支持中英混合关键词、可配置结果数量：

```js
export const webSearch = tool(
  async input => {
    return tavilyWebSearch(input.query, input.count ?? 10)
  },
  {
    name: 'web_search',
    description: '使用 Tavily 联网搜索 API 检索互联网网页',
    schema: z.object({
      query: z.string().min(1).describe('搜索关键词'),
      count: z.number().int().min(1).max(20).optional(),
    }),
  },
)
```

### todoListMiddleware — 任务追踪

`createDeepAgent` 内置 `todoListMiddleware`，子 Agent 和主 Agent 都可以通过 `write_todos` 工具列出执行步骤，CLI 侧实时显示进度：

```js
// todo-middleware-test.mjs — 最小示例
const agent = createAgent({
  model,
  tools: [],
  systemPrompt: '你是生活规划助手...',
  middleware: [todoListMiddleware()],
})
```

### CLI 流式输出

`cli.mjs` 通过 `agent.stream()` + `subgraphs: true` 监听所有子图事件，按角色分段输出：

- `[主 Agent] model_request` — 主 Agent 调用模型
- `[subagent:researcher] model_request` — 子 Agent 调用模型
- 文件操作、搜索调用、eval 计算实时显示

### maxInputTokens 上下文窗口管理

`max-input-tokens-test.mjs` 演示如何用 `trimMessages` 在上下文溢出前自动裁剪历史消息：

```js
const trimmed = await trimMessages(messages, {
  maxTokens: MAX_TOKENS,
  tokenCounter: model,
  strategy: 'last', // 保留最近的消息
  includeSystem: true, // 始终保留 SystemMessage
})
```

## 文件约定

| 目录                                    | 用途             |
| --------------------------------------- | ---------------- |
| `/workspace/sources/question.txt`       | 用户原始问题     |
| `/workspace/sources/research_plan.md`   | 调研计划         |
| `/workspace/sources/findings_*.md`      | 各子主题调研结果 |
| `/workspace/sources/analysis_*.md`      | 数据分析结果     |
| `/workspace/reports/draft_*.md`         | 报告草稿         |
| `/workspace/reports/report_*_[日期].md` | 最终交付报告     |

## 运行方式

```bash
# 交互模式（启动后输入调研主题）
pnpm dev src/deep-research-assistant/src/cli.mjs

# 命令行传参
pnpm dev src/deep-research-assistant/src/cli.mjs "2026年主流 AI Agent 框架对比分析"

# todoListMiddleware 最小示例
pnpm dev src/deep-research-assistant/src/todo-middleware-test.mjs

# maxInputTokens 上下文裁剪示例
pnpm dev src/deep-research-assistant/src/max-input-tokens-test.mjs
```

需在根目录 `.env` 配置 `MODEL_NAME`、`OPENAI_API_KEY`、`OPENAI_BASE_URL`、`TAVILY_API_KEY`。

可通过 `RECURSION_LIMIT` 环境变量调整最大递归步数（默认 300）。

## 与第 25 章的关系

| 维度       | 第 25 章（Middleware 体系）         | 第 26 章（深度调研助手）      |
| ---------- | ----------------------------------- | ----------------------------- |
| 定位       | 逐一演示各 Middleware 能力          | 多个 Middleware 组合实战      |
| API        | `createAgent` + 手动组装 Middleware | `createDeepAgent` 高层封装    |
| Agent 数量 | 单个或主 + 子（固定流水线）         | 主 + 3 类子 Agent（动态委派） |
| 工具       | calc、divide_evenly 等教学工具      | 真实联网搜索 + 代码执行       |
| 产出       | 控制台输出演示                      | 完整调研报告文件              |

## 扩展方向

- 增加 `browser` 子 Agent：对搜索到的页面进行深度阅读（使用 `agent-browser`）
- 引入 Summarization Middleware：长调研任务中自动压缩历史对话
- 接入 Milvus 向量库：将历史 findings 存入向量库，新调研时检索相关前置研究
- 对接 NestJS 后端：将 CLI 改为 Web 服务，前端展示调研进度和报告

---

⬅️ [DeepAgents Middleware](./25-deepagents-middleware.md) ｜ [📚 目录](../../README.md#目录) ｜ ➡️
