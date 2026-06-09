# deep-agents 模块记忆

## 项目概览

demo-agent 仓库中专门演示 deepagents 库内置 Middleware 的模块。通过 5 个独立 Agent 示例，分别展示 deepagents 提供的六大核心 Middleware 能力，另有 2 个自定义 Middleware 测试脚本。

## 技术栈

- Node.js (ESM)
- LangChain (`createAgent`)
- deepagents `^1.10.2`（Middleware 库）
- Zod（自定义 Middleware state schema）
- 共享模型配置：`@/shared/model.mjs`
- 本仓库主入口脚本是 src/deepagents/memory-agent.mjs

## 目录结构

```
src/deep-agents/
├── src/
│   ├── deepagents/
│   │   ├── filesystem-agent.mjs      # FilesystemMiddleware 演示
│   │   ├── memory-agent.mjs          # MemoryMiddleware + FilesystemMiddleware 演示
│   │   ├── skills-agent.mjs          # SkillsMiddleware + FilesystemMiddleware + LocalShellBackend 演示
│   │   ├── subagent-agent.mjs        # SubAgentMiddleware 演示（四则运算/天气/搜索子 Agent）
│   │   ├── summarization-agent.mjs   # SummarizationMiddleware 演示（对话摘要）
│   │   ├── workspace/                # filesystem-agent 的工作区
│   │   ├── workspace-memory/         # memory-agent 的工作区（含 AGENTS.md + memory/）
│   │   └── workspace-summarization/  # summarization-agent 的工作区（含 conversation_history/）
│   ├── middleware-test.mjs           # 自定义 Middleware 演示（日志 + 调用计数）
│   └── middleware-test2.mjs          # 自定义 Middleware 进阶（wrapToolCall 扩展工具注册与执行）
└── package.json
```

## 运行方式

所有脚本通过根 workspace 的 `pnpm -w dev` 启动（使用 tsx 运行，支持 `@/` 路径别名）。
