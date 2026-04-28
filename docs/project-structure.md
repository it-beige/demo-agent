# 📁 项目结构

> 本仓库的完整目录结构。每个子目录对应一个或多个章节的示例代码，详细说明请到对应章节文档查看。

---

```text
.
├── agent-react-todo.mjs        # Agent 示例启动入口
├── src/
│   ├── demo/                   # 示例代码目录（从 src/ 迁移）
│   │   ├── agent-react-todo.mjs    # Agent 示例任务
│   │   ├── langchain-mcp-test.mjs  # LangChain MCP 测试
│   │   ├── loader-and-spliter.mjs  # Puppeteer 抓取掘金文章
│   │   ├── loader-and-spliter2.mjs # RAG + 兼容性加载方案
│   │   ├── mcp-amap.mjs            # 地图 + filesystem MCP Client 示例
│   │   ├── mcp-server.mjs          # MCP Server 示例
│   │   ├── mco-amap-flow.md        # MCP Agent 调用流程图
│   │   ├── rag-demo.mjs            # RAG 配置与健康检查示例
│   │   └── tiktoken-test.mjs       # Tiktoken 测试
│   ├── memory/                 # 对话记忆管理示例目录
│   │   ├── history-test.mjs               # InMemoryChatMessageHistory 基础用法
│   │   ├── history-test2.mjs              # FileSystemChatMessageHistory 持久化存储
│   │   ├── history-test3.mjs              # 从文件恢复历史对话
│   │   ├── truncation-memory.mjs          # 消息截断策略（按消息数/token数）
│   │   ├── summarization-memory.mjs       # 基于消息数量的对话总结
│   │   ├── summarization-memory2.mjs      # 基于 token 数量的对话总结
│   │   ├── constant.mjs                   # 集合名称常量定义
│   │   ├── insert-conversations.mjs       # 批量插入对话到 Milvus
│   │   ├── retrieval-memory.mjs           # RAG 检索增强生成流程
│   │   ├── query-conversations.mjs        # 查询 Milvus 中的所有记录
│   │   └── chat_history.json              # 文件存储示例
│   ├── splitters/              # 文本分割器示例目录
│   │   ├── CharacterTextSplitter-test.mjs           # 基于字符的分割
│   │   ├── RecursiveCharacterTextSplitter-test.mjs  # 递归字符分割（自定义分隔符）
│   │   ├── TokenTextSplitter-test.mjs               # 基于 Token 计数的分割
│   │   ├── recursive-splitter-code.mjs              # 代码专用分割器
│   │   ├── recursive-splitter-markdown.mjs          # Markdown 文档分割
│   │   └── recursive-splitter-latex.mjs             # LaTeX 公式分割
│   ├── output-parse/           # 结构化大模型输出示例目录
│   │   ├── normal.mjs                             # 手动 JSON.parse 基础演示
│   │   ├── json-output-parser.mjs                 # JsonOutputParser 智能提取
│   │   ├── structured-output-parser.mjs           # StructuredOutputParser 字段定义
│   │   ├── zod-schema-parser.mjs                  # Zod Schema 完整类型系统
│   │   ├── with-structured-output.mjs             # 现代 API 一行搞定
│   │   ├── stream-normal.mjs                      # 普通文本流式输出
│   │   ├── stream-structured-partial.mjs          # 流式 + 结构化（两阶段）
│   │   ├── stream-tool-calls-raw.mjs              # 流式 Tool Calls 原始数据
│   │   ├── stream-tool-calls-parser.mjs           # 流式 Tool Calls 智能解析
│   │   └── xml-output-parser.mjs                  # XML 格式输出解析
│   ├── output-parse-demo/      # 智能录入与 Mini Cursor Agent 实战示例
│   │   ├── smart-import.mjs                       # AI 智能数据录入（文本提取 + 数据库插入）
│   │   ├── mini-cursor.mjs                        # Mini Cursor Agent（ReAct 模式）
│   │   ├── create-table.mjs                       # 数据库初始化脚本
│   │   ├── constant.mjs                           # 数据库配置常量
│   │   └── docker-compose-mysql.yml               # MySQL Docker 配置
│   ├── prompt-template/        # PromptTemplate 组件化管理示例目录
│   │   ├── prompt-template1.mjs                   # 基础模板用法
│   │   ├── pipeline-prompt-template.mjs           # 管道模板（模块化组合）
│   │   ├── pipeline-prompt-template2.mjs          # OKR 评审场景
│   │   ├── pipeline-prompt-template3.mjs          # Pipeline + Chat 组合
│   │   ├── partial.mjs                            # 部分应用（.partial()）
│   │   ├── chat-prompt-template.mjs               # 对话模板基础
│   │   ├── chat-prompt-template2.mjs              # 多轮对话示例
│   │   ├── fewshot-prompt-template.mjs            # 少样本模板（字符串）
│   │   ├── fewshot-chat-prompt-template.mjs       # 少样本对话模板
│   │   ├── example-selector1.mjs                  # 动态选择示例（基础）
│   │   ├── example-selector2.mjs                  # 基于相似度选择示例
│   │   ├── weekly-report-examples-writer-milvus.mjs  # 写入示例到 Milvus
│   │   └── weekly-report-examples-reader-milvus.mjs  # 从 Milvus 检索示例
│   ├── runnable/              # Runnable 组装 Chain 示例目录
│   │   ├── before.mjs                           # 传统方式对比基准
│   │   ├── runnable.mjs                         # RunnableSequence 串行执行
│   │   └── api-case/                            # 核心 API 示例
│   │       ├── RunnableLambda.mjs               # 自定义函数包装
│   │       ├── RunnableMap.mjs                  # 并行执行
│   │       ├── RunnableBranch.mjs               # 条件分支
│   │       ├── RunnableRoute.mjs                # 键值路由
│   │       ├── RunnablePassthrough.mjs          # 数据直通/赋值
│   │       ├── RunnableEach.mjs                 # 数组遍历
│   │       ├── RunnablePick.mjs                 # 字段选择
│   │       └── api-case/                        # 高级特性示例
│   │           ├── RunnableWithRetry.mjs        # 失败自动重试
│   │           ├── RunnableWithFallbacks.mjs    # 备选方案降级
│   │           ├── RunnableWithConfig.mjs       # 配置传递
│   │           ├── RunnableWithCallbacks.mjs    # 回调监听
│   │           └── RunnableWithMessageHistory.mjs  # 多轮对话记忆
│   ├── asr-and-tts-nest-service/  # Nest + LangChain 流式 AI 接口示例
│   │   ├── src/
│   │   │   ├── ai/
│   │   │   │   ├── ai.controller.ts        # SSE 控制器（@Sse 装饰器）
│   │   │   │   ├── ai.service.ts            # LangChain Chain + 流式输出
│   │   │   │   ├── ai.module.ts             # 依赖注入 + 模型工厂提供者
│   │   │   │   ├── dto/                     # DTO 定义
│   │   │   │   └── entities/                # 实体定义
│   │   │   ├── book/                        # 示例 CRUD 模块（脚手架预留）
│   │   │   ├── utils/
│   │   │   │   └── config.util.ts           # .env 自动查找工具
│   │   │   ├── app.module.ts                # 应用根模块
│   │   │   └── main.ts                      # 启动入口
│   │   └── public/
│   │       └── index.html                   # SSE 前端测试页面
│   ├── cron-job-tool/          # Nest + Tool Calling AI 智能助手示例
│   │   ├── src/
│   │   │   ├── ai/
│   │   │   │   ├── ai.controller.ts        # AI 控制器（chat + chat/stream 端点）
│   │   │   │   ├── ai.service.ts            # ReAct 循环 + 工具调度 + 流式输出
│   │   │   │   ├── ai.module.ts             # 工厂提供者 + 三个工具注册
│   │   │   │   └── user.service.ts          # 用户数据服务（Map 内存数据库）
│   │   │   ├── utils/
│   │   │   │   └── config.util.ts           # .env 自动查找工具
│   │   │   ├── app.module.ts                # 应用根模块
│   │   │   └── main.ts                      # 启动入口
│   │   └── README.md                        # Nest CLI 默认 README
│   ├── tts-stt-nest/           # Nest + 腾讯云 TTS/ASR 实现实时语音助手示例
│   │   ├── src/
│   │   │   ├── ai/
│   │   │   │   ├── ai.controller.ts        # SSE 控制器（@Sse 装饰器 + Observable）
│   │   │   │   ├── ai.service.ts            # LangChain Chain + AsyncGenerator + 事件发布
│   │   │   │   └── ai.module.ts             # ChatOpenAI 工厂提供者（支持自定义 baseURL）
│   │   │   ├── speech/
│   │   │   │   ├── speech.controller.ts    # ASR 控制器（文件上传端点）
│   │   │   │   ├── speech.service.ts        # ASR 语音识别服务（腾讯云 ASR SDK）
│   │   │   │   ├── speech.module.ts         # 语音模块（腾讯云 SDK 工厂 + Relay 注入）
│   │   │   │   ├── tts-relay.service.ts     # TTS 中继服务（会话管理 + 腾讯云转发 + 缓冲机制）
│   │   │   │   └── tts-config.builder.ts    # TTS 配置构建器（HMAC-SHA1 签名 + WebSocket URL）
│   │   │   ├── gateways/
│   │   │   │   ├── tts.gateway.ts           # WebSocket 网关（/tts 端点 + 薄封装模式）
│   │   │   │   ├── ws-adapter.ts            # 原生 ws 库适配器（替代 Socket.IO）
│   │   │   │   └── gateways.module.ts       # 网关模块声明
│   │   │   ├── common/
│   │   │   │   └── stream-events.ts         # 事件类型定义（AiTtsStreamEvent 联合类型）
│   │   │   ├── utils/
│   │   │   │   ├── config.util.ts           # .env 自动查找工具
│   │   │   │   └── detect-port.util.ts      # 端口占用检测与自动切换
│   │   │   ├── app.module.ts                # 应用根模块（AI + Speech + Gateways）
│   │   │   └── main.ts                      # 启动入口（HTTP + WebSocket 服务器）
│   │   └── public/
│   │       ├── index.html                   # 单页语音助手前端（录音 + ASR + SSE + MediaSource）
│   │       └── simple-test.html             # TTS WebSocket 简单测试页面
│   ├── tool-runner.mjs         # 工具调用循环
│   └── tools/                  # 本地工具实现
└── react-todo-app/             # Agent 生成的 React Todo 示例项目
```

---

## ➡️ 下一步

- 📚 回到 [章节目录](./../README.md#-章节目录) 按章节学习
- 🗺️ 查看 [推荐学习顺序](./learning-path.md)
