# [Agent] ReAct 循环与本地工具调用

> 模型通过 ReAct 循环（推理→行动→观察）自主调用本地工具，从零生成一个完整的 React Todo 应用。
> **关键词**：ReAct 循环、工具调用、文件读写、命令执行

## 核心设计

这个 demo 演示了 Agent 最核心的闭环：给模型一个自然语言任务描述，它通过 `while (tool_calls.length > 0)` 循环反复执行"思考需要什么信息 → 调用对应工具 → 观察结果 → 继续思考"，直到不再产生新的工具调用或达到 `maxIterations` 上限。

整个 ReAct 循环引擎封装在 `tool-runner.mjs` 的 `runToolAgent()` 中。入口 `index.mjs` 先构造包含任务上下文和工具使用规范的 SystemMessage，再调用 `runToolAgent()` 启动循环。关键设计点：

- **工具绑定**：`model.bindTools(tools)` 将 4 个工具的 Zod Schema 注入模型，模型据此判断是否需要调工具、调哪个。每个工具用 `@langchain/core/tools` 的 `tool()` 创建，参数由 Zod 约束类型，模型无法传错格式
- **并行执行**：当模型一次返回多个 `tool_calls` 时，用 `Promise.all` 并行执行，而非串行等待——对于互不依赖的独立操作（如同时写多个文件），效率提升明显
- **失败不中断**：每个工具内部有 try/catch，异常返回错误消息而非抛异常；工具找不到时也返回友好提示。这样单个工具失败不会打断整个循环，模型能根据错误消息调整策略
- **结果回传**：工具执行结果封装为 `ToolMessage`，按 `tool_call_id` 一一对应追加到消息历史，模型在下一轮推理时能看到所有结果
- **循环上限**：`maxIterations`（默认 30）防止模型在反复失败或误解任务时无限循环

内置 4 个本地工具，每个负责一类原子操作：

- **`file-read`**：读取文件内容，传入文件路径，返回完整文本
- **`file-write`**：写入文件，自动递归创建父目录（`mkdir({ recursive: true })`），模型不需要关心目录是否已存在
- **`directory-list`**：列出目录内容，用于模型确认文件是否已创建、了解项目结构
- **`command-execute`**：通过 `spawn`（`shell: true`）执行系统命令。核心设计是 `workingDirectory` 参数——模型用此参数指定执行目录，而非在 command 里手动 `cd`。SystemMessage 中明确禁止 `cd && command` 写法，避免路径切换时的竞态和不一致。执行成功后还会提示模型后续命令继续使用同一 `workingDirectory`

任务描述是中文的自然语句（"创建一个功能丰富的 React TodoList 应用..."），模型需要自己理解任务目标、规划步骤、选择工具。最终产物 `react-todo-app/` 包含增删改查、筛选统计、localStorage 持久化和 CSS 动画。

## 运行方式

```bash
# 直接运行 demo（需要先在 .env 中配置 API_KEY 等）
node src/demo/agent-react-todo.mjs

# 或在代码中调用
import { runAgentWithTools } from '@/index.mjs'
await runAgentWithTools('你的任务描述')
```

## 扩展方向

- 改写任务描述，让 Agent 生成 Vue/Svelte 项目，观察它是否能自适应不同技术栈
- 给工具加上超时和重试逻辑（当前错误仅返回消息，无自动重试），观察 Agent 的恢复策略
- 增加日志持久化，分析多轮调用中模型的决策质量
- 减小 `maxIterations` 观察任务中断时的 Agent 行为，或增大它让更复杂的任务有充足轮次

---

⬅️ ｜ [📚 目录](../../README.md#目录) ｜ [MCP Server 基础 ➡️](./02-mcp-server-basic.md)
