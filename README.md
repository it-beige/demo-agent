# demo-agent

> 一个面向学习的示例仓库，用来理解两类常见 AI 应用形态：
>
> 1. **Agent**：让模型结合本地工具完成一个实际任务
> 2. **MCP Server**：把本地能力封装成标准化工具，供 Cursor 等 MCP Client 调用

---

## 🚀 快速开始

| 步骤 | 操作                                                     | 文档                                               |
| ---- | -------------------------------------------------------- | -------------------------------------------------- |
| 1️⃣   | 检查环境要求（Node.js 18+ / pnpm / OpenAI 兼容模型服务） | [📦 环境要求](./docs/getting-started.md#-环境要求) |
| 2️⃣   | 安装依赖 `pnpm install`                                  | [⬇️ 安装依赖](./docs/getting-started.md#-安装依赖) |
| 3️⃣   | 在根目录 `.env` 配置 `MODEL`、`API_KEY`、`BASE_URL`      | [🔧 环境变量](./docs/getting-started.md#-环境变量) |
| 4️⃣   | 选择感兴趣的章节开始学习                                 | [📚 章节目录](#-章节目录)                          |

> 完整的环境配置说明（高德地图 / 向量检索 / 数据库 / 邮件 / 互联网搜索）请见 [快速开始文档](./docs/getting-started.md)。

---

## 📚 章节目录

**本仓库按章节逐步添加学习内容**，每个章节聚焦一个主题。点击章节标题进入对应文档：

| #   | 章节                                                                                          | 关键词                                  |
| --- | --------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | [Agent 基础示例](./docs/chapters/01-agent-basic.md)                                           | ReAct 循环、本地工具调用                |
| 2   | [MCP Server 基础](./docs/chapters/02-mcp-server-basic.md)                                     | Tool / Resource、stdio、Zod             |
| 3   | [多 MCP Server 集成](./docs/chapters/03-multi-mcp.md)                                         | MultiServerMCPClient、高德地图          |
| 4   | [RAG 检索增强生成](./docs/chapters/04-rag.md)                                                 | Embeddings 降级、关键词检索兜底         |
| 5   | [动态网站内容提取](./docs/chapters/05-dynamic-content.md)                                     | Puppeteer、动态渲染                     |
| 6   | [兼容性加载方案](./docs/chapters/06-compatibility-loader.md)                                  | Cheerio + Puppeteer 渐进式降级          |
| 7   | [文本分割器详解](./docs/chapters/07-text-splitter.md)                                         | RecursiveCharacterTextSplitter、Token   |
| 8   | [对话记忆管理](./docs/chapters/08-conversation-memory.md)                                     | 截断 / 总结 / 检索三大策略、Milvus      |
| 9   | [结构化大模型输出](./docs/chapters/09-structured-output.md)                                   | Zod、withStructuredOutput、Tool Calls   |
| 10  | [智能录入与 Mini Cursor Agent](./docs/chapters/10-smart-import-mini-cursor.md)                | MySQL 实战、流式 ReAct                  |
| 11  | [PromptTemplate 组件化管理](./docs/chapters/11-prompt-template.md)                            | Pipeline、Few-Shot、动态示例选择        |
| 12  | [Runnable - 把写逻辑变成组装 Chain](./docs/chapters/12-runnable-chain.md)                     | Sequence / Map / Branch / 重试 / 降级   |
| 13  | [Nest + LangChain 实现基于 SSE 的流式 AI 接口](./docs/chapters/13-nest-langchain-sse.md)      | NestJS SSE、流式输出、EventSource       |
| 14  | [Nest + Tool Calling 实现 AI 智能助手（ReAct 循环）](./docs/chapters/14-nest-tool-calling.md) | 工厂提供者、bindTools、流式工具调用     |
| 15  | [Nest + Tool 实现 OpenClaw 同款定时任务](./docs/chapters/15-nest-cron-job.md)                 | TypeORM、SchedulerRegistry、AI 任务执行 |
| 16  | [AGUI 协议：Vercel AI SDK + LangChain 实现流式组件渲染](./docs/chapters/16-agui-protocol.md)  | UIMessage、ToolPanel、全栈              |
| 17  | [Nest + 腾讯云 TTS/ASR 实现实时语音助手](./docs/chapters/17-nest-tts-asr.md)                  | WebSocket 中继、MediaSource、事件驱动   |
| 18  | [图形编排引擎：LangGraph 和多 Agent 架构](./docs/chapters/18-langgraph-multi-agent.md)        | StateGraph、条件路由、HITL、Supervisor  |

---

## 🎯 按主题学

如果你不想按章节顺序读，也可以从感兴趣的主题切入：

### Agent & MCP

理解模型如何在多轮中自主调用工具、MCP 协议如何标准化能力供给。

- 基础：[第 1 章](./docs/chapters/01-agent-basic.md) → [第 2 章](./docs/chapters/02-mcp-server-basic.md) → [第 3 章](./docs/chapters/03-multi-mcp.md)
- 实战：[第 14 章 Tool Calling](./docs/chapters/14-nest-tool-calling.md) → [第 15 章 定时任务](./docs/chapters/15-nest-cron-job.md)
- 概念辨析：[Agent 和 MCP 怎么区分](./docs/concepts.md#-agent-和-mcp-怎么区分)

### RAG & 向量检索

把外部知识接入大模型，构建可检索的智能问答。

- [第 4 章 RAG 检索增强生成](./docs/chapters/04-rag.md)
- [第 5 章 动态网站内容提取](./docs/chapters/05-dynamic-content.md)
- [第 6 章 兼容性加载方案](./docs/chapters/06-compatibility-loader.md)
- [第 7 章 文本分割器详解](./docs/chapters/07-text-splitter.md)

### 对话记忆管理

应对超长对话的截断、总结、检索三大策略。

- [第 8 章 对话记忆管理](./docs/chapters/08-conversation-memory.md)

### 结构化输出

让 AI 稳定可靠地返回结构化数据，从 JSON.parse 到 withStructuredOutput。

- [第 9 章 结构化大模型输出](./docs/chapters/09-structured-output.md)

### 实战应用

把前面学到的能力组装成真正能跑的项目。

- [第 10 章 智能录入与 Mini Cursor Agent](./docs/chapters/10-smart-import-mini-cursor.md)
- [第 13 章 Nest + LangChain 流式 AI 接口](./docs/chapters/13-nest-langchain-sse.md)
- [第 14 章 Nest + Tool Calling AI 智能助手](./docs/chapters/14-nest-tool-calling.md)
- [第 15 章 Nest + AI 定时任务系统](./docs/chapters/15-nest-cron-job.md)
- [第 16 章 AGUI 流式组件渲染](./docs/chapters/16-agui-protocol.md)
- [第 17 章 Nest + 实时语音助手](./docs/chapters/17-nest-tts-asr.md)

### 提示词工程

复杂提示词的组件化、模块化、动态选择。

- [第 11 章 PromptTemplate 组件化管理](./docs/chapters/11-prompt-template.md)

### LangChain 工程化

声明式组装 Chain、重试 / 降级 / 回调 / 配置传递等高级特性。

- [第 12 章 Runnable - 把写逻辑变成组装 Chain](./docs/chapters/12-runnable-chain.md)

### 语音交互与流式媒体

实时语音识别、流式语音合成、MediaSource 音频播放、WebSocket 中继架构。

- [第 17 章 Nest + 实时语音助手](./docs/chapters/17-nest-tts-asr.md)

### 工作流编排 & 多 Agent

用图（Graph）声明式编排 AI 工作流：节点、边、状态、条件分支、循环、人工干预、多 Agent 协作。

- [第 18 章 图形编排引擎：LangGraph 和多 Agent 架构](./docs/chapters/18-langgraph-multi-agent.md)

---

## 📖 进一步阅读

| 文档                                               | 说明                                                    |
| -------------------------------------------------- | ------------------------------------------------------- |
| 🚀 [快速开始](./docs/getting-started.md)           | 环境要求 / 安装依赖 / 完整环境变量配置                  |
| 📁 [项目结构总览](./docs/project-structure.md)     | 整个仓库的目录树详解                                    |
| 🧠 [核心概念](./docs/concepts.md)                  | Agent 内置工具说明、Agent vs MCP、`react-todo-app` 说明 |
| 🗺️ [推荐学习顺序](./docs/learning-path.md)         | 按主题给出的学习路径建议                                |
| ✏️ [建议动手练习](./docs/exercises.md)             | 每章配套的动手练习（共 8 大组、上百个练习点）           |
| 🐛 [踩坑记录与注意事项](./docs/troubleshooting.md) | MCP 配置真实踩坑、各章节运行注意事项                    |
| 🌱 [后续扩展方向](./docs/roadmap.md)               | 想为本项目贡献？这里有方向                              |

---

## 🏗️ 项目结构概览

> 完整目录树见 [📁 项目结构总览](./docs/project-structure.md)。以下是核心目录的快速导航：

### 核心目录

| 目录                                       | 说明                                       | 对应章节    |
| ------------------------------------------ | ------------------------------------------ | ----------- |
| `src/demo/`                                | MCP Server、Agent、RAG 基础示例            | 第 1-6 章   |
| `src/memory/`                              | 对话记忆管理（截断/总结/检索）             | 第 8 章     |
| `src/output-parse/`                        | 结构化输出（Zod/流式/Tool Calls）          | 第 9 章     |
| `src/output-parse-demo/`                   | 智能录入 + Mini Cursor Agent 实战          | 第 10 章    |
| `src/prompt-template/`                     | PromptTemplate 组件化（Pipeline/Few-Shot） | 第 11 章    |
| `src/runnable/`                            | Runnable 链式组装（Sequence/Map/Branch）   | 第 12 章    |
| `src/asr-and-tts-nest-service/`            | Nest + LangChain SSE 流式接口              | 第 13 章    |
| `src/cron-job-tool/`                       | Nest + Tool Calling AI 智能助手            | 第 14-15 章 |
| `src/agui-backend/` + `src/agui-frontend/` | AGUI 协议全栈项目                          | 第 16 章    |
| `src/tts-stt-nest/`                        | Nest + 腾讯云 TTS/ASR 实时语音助手         | 第 17 章    |

### NestJS 项目结构

本仓库包含 4 个 NestJS 项目，均采用相似的模块组织方式：

| 项目                       | 核心模块                                       | 特色功能                               |
| -------------------------- | ---------------------------------------------- | -------------------------------------- |
| `asr-and-tts-nest-service` | `AiModule`                                     | SSE 流式输出、EventSource 前端         |
| `cron-job-tool`            | `AiModule`                                     | ReAct 循环、Tool Calling、MailerModule |
| `agui-backend`             | `AiModule`                                     | AGUI 协议、UIMessage、全栈             |
| `tts-stt-nest`             | `AiModule` + `SpeechModule` + `GatewaysModule` | WebSocket 中继、MediaSource、事件驱动  |

**以第 17 章 `tts-stt-nest` 为例**：

```
tts-stt-nest/
├── src/
│   ├── ai/                          # AI 模块（LangChain 流式对话）
│   │   ├── ai.controller.ts         # SSE 端点：POST /ai/chat/stream
│   │   ├── ai.service.ts            # AsyncGenerator + 事件发布
│   │   └── ai.module.ts             # ChatOpenAI 工厂提供者
│   ├── speech/                      # 语音模块（ASR + TTS）
│   │   ├── speech.controller.ts     # ASR 端点：POST /speech/asr/file
│   │   ├── speech.service.ts        # 腾讯云 ASR SDK
│   │   ├── speech.module.ts         # 腾讯云 SDK 工厂 + Relay 注入
│   │   ├── tts-relay.service.ts     # TTS 中继（会话管理 + 腾讯云转发）
│   │   └── tts-config.builder.ts    # HMAC-SHA1 签名 + WebSocket URL
│   ├── gateways/                    # WebSocket 网关模块
│   │   ├── tts.gateway.ts           # /tts 端点（薄封装）
│   │   ├── ws-adapter.ts            # 原生 ws 适配器
│   │   └── gateways.module.ts       # 模块声明
│   ├── common/                      # 公共类型定义
│   │   └── stream-events.ts         # AiTtsStreamEvent 联合类型
│   ├── utils/                       # 工具函数
│   │   ├── config.util.ts           # .env 自动查找
│   │   └── detect-port.util.ts      # 端口自动切换
│   ├── app.module.ts                # 根模块（导入 AI + Speech + Gateways）
│   └── main.ts                      # 启动入口（HTTP + WebSocket）
└── public/
    ├── index.html                   # 语音助手前端（MediaSource 流式播放）
    └── simple-test.html             # TTS 简单测试页
```

## 🤝 一句话使用建议

- **第一次接触？** 先按 [📚 章节目录](#-章节目录) 顺序看 1 → 4 → 8 → 14 这条主线，再回头补其他章节。
- **想找某个具体能力？** 直接在 [🎯 按主题学](#-按主题学) 里点进去。
- **遇到问题？** 先翻 [🐛 踩坑记录](./docs/troubleshooting.md)，常见坑都在里面。
