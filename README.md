# demo-agent

一个面向学习的示例仓库，用来理解两类常见 AI 应用形态：

1. `Agent`：让模型结合本地工具完成一个实际任务
2. `MCP Server`：把本地能力封装成标准化工具，供 Cursor 等 MCP Client 调用

这个仓库不是生产级框架，更像一个方便拆开阅读、动手实验、逐步扩展的最小示例集合。

## 📚 学习目录

本仓库按章节逐步添加学习内容，每个章节聚焦一个主题：

### 第 1 章：Agent 基础示例

- **文件**：`src/demo/agent-react-todo.mjs`, `src/tools/*`
- **内容**：模型调用本地工具（读/写文件、执行命令）完成任务
- **产物**：自动生成 React Todo 应用

### 第 2 章：MCP Server 基础

- **文件**：`src/demo/mcp-server.mjs`
- **内容**：Tool、Resource 定义，stdio 通信，zod 参数校验
- **重点**：理解 MCP 协议的基本组成

### 第 3 章：多 MCP Server 集成

- **文件**：`src/demo/mcp-amap.mjs`
- **内容**：MultiServerMCPClient、高德地图 MCP、filesystem MCP
- **流程图**：`src/demo/mco-amap-flow.md`

### 第 4 章：RAG 检索增强生成

- **文件**：`src/demo/loader-and-spliter2.mjs`, `src/demo/rag-demo.mjs`
- **内容**：网页加载 → 文本切分 → 向量索引 → 检索回答
- **重点**：chunkSize/chunkOverlap、embeddings 降级兜底

### 第 5 章：动态网站内容提取

- **文件**：`src/demo/loader-and-spliter.mjs`
- **内容**：Puppeteer 抓取掘金文章、Document 转换、文本分割
- **重点**：处理 JavaScript 动态渲染的内容

### 第 6 章：兼容性加载方案

- **文件**：`src/demo/loader-and-spliter2.mjs`
- **内容**：Cheerio + Puppeteer 渐进式降级策略
- **重点**：性能与稳定性的平衡设计

### 第 7 章：文本分割器详解

- **文件**：`src/splitters/` 目录下的示例代码
- **内容**：CharacterTextSplitter、RecursiveCharacterTextSplitter、TokenTextSplitter 以及面向特定格式的代码/Markdown/LaTeX 分割器
- **重点**：不同分割策略的适用场景、chunkSize/chunkOverlap 调优、Token 计数控制
- **补充**：语言特定的分割器配置（fromLanguage）

### 第 8 章：对话记忆管理

- **文件**：`src/memory/` 目录下的示例代码
- **内容**：三大记忆管理策略（截断、总结、检索）
  - **基础存储**：InMemoryChatMessageHistory、FileSystemChatMessageHistory
  - **截断策略**：按消息数量截断、按 token 数量截断（trimMessages API）
  - **总结策略**：基于消息数量的总结、基于 token 数量的精确总结
  - **检索策略**：Milvus 向量数据库存储、语义检索、RAG 完整流程
- **重点**：记忆存储策略对比、token 级别的消息管理、向量检索实现、RAG 数据流
- **核心问题**：如何在对话历史过长时智能管理记忆，避免超出模型上下文窗口

### 第 9 章：结构化大模型输出

- **文件**：`src/output-parse/` 目录下的示例代码
- **内容**：从基础到高级的结构化输出解析技术
  - **基础解析**：手动 JSON.parse()、JsonOutputParser 智能提取
  - **结构化定义**：StructuredOutputParser 字段定义、Zod Schema 完整类型系统
  - **现代 API**：withStructuredOutput() 最简封装、一行搞定结构化输出
  - **流式输出**：普通文本流式、结构化数据流式、增量 diff 显示算法
  - **Tool Calls**：原生函数调用、流式工具调用、JsonOutputToolsParser 解析
  - **XML 格式**：XMLOutputParser XML 格式输出解析
- **重点**：输出解析器家族对比、流式与结构化组合、Tool Calls 原生能力、生产级最佳实践
- **核心问题**：如何稳定可靠地让 AI 返回符合预期的结构化数据

### 第 10 章：智能录入与 Mini Cursor Agent

- **文件**：`src/output-parse-demo/` 目录下的实战示例
- **内容**：两个完整的 AI 应用实战案例
  - **智能数据录入**：AI 驱动的非结构化文本提取 + MySQL 批量插入
    - Zod Schema 定义数据结构、withStructuredOutput 自动解析
    - 批量插入语法、事务处理、环境变量配置
  - **Mini Cursor Agent**：简化版 AI 编程助手实现
    - ReAct 模式（推理 → 行动 → 观察循环）
    - 流式工具调用处理、增量 diff 显示算法
    - 消息历史管理、多轮自主任务执行
  - **工程化配置**：数据库常量提取、Docker Compose 服务编排
- **重点**：从理论到实战的完整链路、Agent 自主决策机制、流式处理优化
- **核心问题**：如何将 AI 输出解析技术应用到真实业务场景中

### 第 11 章：PromptTemplate 组件化管理

- **文件**：`src/prompt-template/` 目录下的示例代码
- **内容**：从基础模板到组件化的完整演进路径
  - **基础模板**：PromptTemplate 基础用法、占位符替换
  - **管道模板**：PipelinePromptTemplate 模块化组合、子模板复用
  - **部分应用**：.partial() 预填充变量、模板工厂模式
  - **对话模板**：ChatPromptTemplate 多角色消息、system/human/assistant
  - **少样本模板**：FewShotPromptTemplate 示例指导、FewShotChatMessagePromptTemplate 对话示例
  - **向量检索**：Milvus 存储示例、动态检索最相关示例
- **重点**：模板组件化、模块复用、动态示例选择、对话格式标准化
- **核心问题**：如何管理复杂提示词，让它可维护、可复用、可测试

### 第 12 章：Runnable - 把写逻辑变成组装 Chain

- **文件**：`src/runnable/` 目录下的示例代码
- **内容**：从传统方式到 Runnable 组装的完整演进路径
  - **传统方式对比**：手动串联 Prompt → Model → OutputParser 的 3 步流程
  - **Runnable 基础**：RunnableSequence 串行执行、.pipe() 链式调用
  - **自定义逻辑**：RunnableLambda 包装自定义函数
  - **并行执行**：RunnableMap 同时执行多个任务、结果合并
  - **条件分支**：RunnableBranch 根据条件动态选择处理路径
  - **键值路由**：RouterRunnable 显式指定 key 选择处理器
  - **数组遍历**：RunnableEach 对数组每个元素应用相同处理
  - **数据流管理**：RunnablePassthrough 直通/赋值、RunnablePick 字段选择
  - **高级特性**：
    - **重试机制**：`.withRetry()` 失败自动重试（`onFailedAttempt` 回调、最大尝试次数）
    - **降级机制**：`.withFallbacks()` 备选方案依次尝试
    - **回调监听**：`callbacks` 监控链执行（Start/End/Error）
    - **配置传递**：`.withConfig()` 动态传递统一配置（`configurable` 业务配置）
    - **对话历史**：`RunnableWithMessageHistory` 多轮对话记忆管理
- **重点**：声明式组装、数据流控制、高级特性组合、生产级最佳实践
- **核心问题**：如何将命令式代码转变为声明式 Chain，提升可维护性和可复用性

### 第 13 章：Nest + LangChain 实现基于 SSE 的流式 AI 接口

- **文件**：`src/asr-and-tts-nest-service/` 目录下的完整 NestJS 项目
- **内容**：NestJS 集成 LangChain，通过 SSE 协议实现流式 AI 对话接口
  - **后端架构**：NestJS 模块化设计、LangChain Chain 流式输出、RxJS Observable 转换
  - **SSE 端点**：`@Sse()` 装饰器声明、AsyncGenerator 流式生成、EventSource 协议规范
  - **前端交互**：EventSource API 消费 SSE、实时状态指示、连接生命周期管理
  - **配置管理**：ConfigModule 环境变量注入、.env 自动向上查找策略
  - **静态托管**：ServeStaticModule 托管前端测试页面
- **重点**：后端流式输出到前端实时渲染的完整链路、NestJS 与 LangChain 的集成模式、SSE 协议的工程化实践
- **核心问题**：如何将 LangChain 的流式能力通过 HTTP 协议稳定地传递到前端

### 第 14 章：Nest + Tool Calling 实现 AI 智能助手（ReAct 循环）

- **文件**：`src/cron-job-tool/` 目录下的完整 NestJS 项目
- **内容**：NestJS 集成 LangChain，实现带工具调用的 AI 智能助手
  - **ReAct 循环**：while(true) 循环让 AI 自主决策——推理 → 调用工具 → 观察结果 → 继续推理
  - **工具定义**：LangChain `tool()` 包装 + Zod 参数校验的工厂提供者模式
  - **查询用户**：query_user 工具 + UserService 内存数据库（三国人物数据）
  - **发送邮件**：send_mail 工具 + @nestjs-modules/mailer SMTP 集成
  - **互联网搜索**：web_search 工具 + Bocha Web Search API 实时搜索
  - **流式输出**：工具调用场景下的流式处理（tool_call_chunks 检测）
- **重点**：ReAct 循环的完整实现、多工具注册与调度、流式 + 工具调用的混合处理、工厂提供者依赖注入
- **核心问题**：如何让 AI 在对话中自主调用外部工具完成复杂任务

---

## 🎯 这个仓库适合学什么

你可以用它快速理解下面几件事，按主题分类：

### Agent & MCP

| 主题           | 学习内容                                                   |
| -------------- | ---------------------------------------------------------- |
| Agent 基础     | 如何给模型挂载本地工具，让模型自己读文件、写文件、执行命令 |
| 工具调用循环   | 模型如何在多轮中自主决策调用工具                           |
| MCP Server     | MCP Server 的基础写法、Tool/Resource 定义、stdio 通信      |
| MCP Client     | 如何把多个 MCP Server 挂到同一个 Agent 上                  |
| filesystem MCP | 允许目录的配置方法（`ALLOWED_PATHS`）                      |
| 场景区分       | Agent 和 MCP 这两种集成方式分别适合什么场景                |

### RAG & 向量检索

| 主题            | 学习内容                                                 |
| --------------- | -------------------------------------------------------- |
| RAG 流程        | "加载 → 切分 → 向量检索 → 回答"的链路怎么串起来          |
| Embeddings 降级 | 当 embeddings 不可用时，怎么降级为关键词检索             |
| 动态内容抓取    | 如何使用 Puppeteer 抓取动态渲染网站的内容                |
| 兼容性方案      | 如何实现 Cheerio + Puppeteer 的兼容性降级方案            |
| 文本分割        | 如何用 RecursiveCharacterTextSplitter 分割长文档         |
| Milvus 基础     | 如何使用 Milvus 进行基础向量数据管理（集合、索引、插入） |
| 向量检索        | 如何通过语义相似度检索相关数据                           |
| 电子书 RAG      | 如何解析 EPUB、按章节切分、构建带元数据的向量索引        |
| 电子书问答      | 如何构建电子书智能问答系统（RAG 流程）                   |

### 对话记忆管理

| 主题       | 学习内容                                                   |
| ---------- | ---------------------------------------------------------- |
| 内存存储   | 如何使用 InMemoryChatMessageHistory 管理内存中的对话历史   |
| 文件持久化 | 如何使用 FileSystemChatMessageHistory 持久化对话到本地文件 |
| 消息截断   | 如何通过 trimMessages API 按消息数或 token 数截断历史      |
| 对话总结   | 如何基于消息数量/token 数量触发对话总结策略                |
| 检索策略   | 如何使用 Milvus 向量数据库存储对话数据                     |
| RAG 闭环   | 如何实现对话记忆的检索-增强-生成-入库闭环                  |

### 结构化输出

| 主题                   | 学习内容                                             |
| ---------------------- | ---------------------------------------------------- |
| 基础解析               | 如何让 AI 稳定返回 JSON 格式的结构化数据             |
| JsonOutputParser       | 如何使用 JsonOutputParser 智能提取和解析 JSON        |
| StructuredOutputParser | 如何用 StructuredOutputParser 定义字段级输出结构     |
| Zod Schema             | 如何使用 Zod Schema 定义复杂嵌套类型和完整类型系统   |
| withStructuredOutput   | 如何用 withStructuredOutput() 一行代码实现结构化输出 |
| 流式输出               | 如何实现流式输出并实时显示 AI 生成内容               |
| 流式 + 结构化          | 如何将流式与结构化结合，边接收边解析数据             |
| Tool Calls             | 如何使用 Tool Calls 利用模型原生函数调用能力         |
| 流式 Tool Calls        | 如何实现流式 Tool Calls 并智能显示增量数据           |
| XML 格式               | 如何使用 XMLOutputParser 处理 XML 格式输出           |

### 智能录入 & Agent 实战

| 主题        | 学习内容                                     |
| ----------- | -------------------------------------------- |
| 数据提取    | 如何让 AI 从自然语言文本中智能提取结构化信息 |
| 数据库插入  | 如何将 AI 提取的数据批量插入 MySQL 数据库    |
| 事务处理    | 如何使用事务保证数据库操作的原子性           |
| Mini Cursor | 如何实现简化版的 AI 编程助手（类似 Cursor）  |
| ReAct 模式  | 如何使用 ReAct 模式让 AI 进行多轮自主决策    |
| 流式 diff   | 如何实现流式工具调用的增量显示（diff 算法）  |
| Docker 部署 | 如何配置 Docker Compose 运行 MySQL 服务      |
| 配置解耦    | 如何提取数据库配置到常量文件实现配置解耦     |

### PromptTemplate 组件化

| 主题       | 学习内容                                     |
| ---------- | -------------------------------------------- |
| 基础模板   | 如何使用 PromptTemplate 管理提示词模板       |
| 管道模板   | 如何用 PipelinePromptTemplate 实现模板组件化 |
| 部分应用   | 如何使用 .partial() 预填充模板变量           |
| 对话模板   | 如何使用 ChatPromptTemplate 定义多角色对话   |
| 少样本模板 | 如何用 FewShotPromptTemplate 提供示例指导    |
| 动态示例   | 如何将 Few-Shot 示例存储到 Milvus 向量数据库 |
| 语义检索   | 如何根据用户输入动态检索最相关的示例         |

### Runnable 链式组装

| 主题       | 学习内容                                                            |
| ---------- | ------------------------------------------------------------------- |
| 基础组装   | 如何使用 RunnableSequence 将多个组件串联成 Chain                    |
| 链式调用   | 如何用 .pipe() 方法实现链式调用                                     |
| 自定义函数 | 如何使用 RunnableLambda 包装自定义函数                              |
| 并行执行   | 如何用 RunnableMap 并行执行多个任务                                 |
| 条件分支   | 如何使用 RunnableBranch 实现条件分支路由                            |
| 键值路由   | 如何用 RouterRunnable 根据 key 显式选择处理器                       |
| 数组遍历   | 如何使用 RunnableEach 对数组进行批量处理                            |
| 数据流管理 | 如何用 RunnablePassthrough 实现数据直通和字段赋值                   |
| 字段选择   | 如何使用 RunnablePick 从对象中挑选指定字段                          |
| 重试机制   | 如何用 .withRetry() 为 Chain 添加重试机制（`onFailedAttempt` 回调） |
| 降级机制   | 如何使用 .withFallbacks() 实现服务降级                              |
| 回调监听   | 如何通过 callbacks 监控 Chain 的执行过程                            |
| 配置传递   | 如何用 .withConfig() 动态传递配置（`configurable` 业务配置）        |
| 对话历史   | 如何使用 RunnableWithMessageHistory 管理多轮对话历史                |

### Nest + LangChain 流式 AI 接口

| 主题       | 学习内容                                                      |
| ---------- | ------------------------------------------------------------- |
| Nest 集成  | 如何在 NestJS 中集成 LangChain，用依赖注入管理模型实例        |
| SSE 端点   | 如何使用 `@Sse()` 装饰器声明 Server-Sent Events 接口          |
| 流式输出   | 如何将 LangChain `chain.stream()` 的 AsyncGenerator 转为 SSE  |
| RxJS 转换  | 如何用 `from()` + `map()` 将 AsyncGenerator 转为 Observable   |
| 前端消费   | 如何使用 EventSource API 在前端接收并实时渲染流式数据         |
| 配置管理   | 如何使用 ConfigModule 注入环境变量、实现 .env 自动查找        |
| 静态托管   | 如何使用 ServeStaticModule 托管前端测试页面                   |
| Chain 构建 | 如何用 PromptTemplate + Model + StringOutputParser 组装 Chain |

### Nest + Tool Calling AI 智能助手

| 主题         | 学习内容                                                   |
| ------------ | ---------------------------------------------------------- |
| ReAct 循环   | 如何用 while(true) 实现推理→工具→观察→推理的自主决策循环   |
| 工具注册     | 如何在 NestJS 中用工厂提供者模式注册多个 LangChain 工具    |
| Tool Calling | 如何用 model.bindTools() 让 AI 具备工具调用能力            |
| 参数校验     | 如何使用 Zod Schema 定义工具参数（字符串、邮箱、数字范围） |
| 工具调度     | 如何根据 tool_calls 分发到不同工具并注入 ToolMessage       |
| 流式混合     | 流式输出中如何检测 tool_call_chunks 区分文本回答和工具调用 |
| 邮件集成     | 如何使用 @nestjs-modules/mailer 通过 SMTP 发送邮件         |
| 互联网搜索   | 如何通过 Bocha Web Search API 让 AI 具备实时搜索能力       |

## 📁 仓库里有什么

详细说明请参考上方的 **📚 学习目录**，这里列出关键文件：

### Agent 示例

- `src/demo/agent-react-todo.mjs`：示例任务描述
- `src/tools/*`：本地工具实现（读/写文件、列目录、执行命令）

### MCP Server 示例

- `src/demo/mcp-server.mjs`：MCP Server 基础示例（query_user 工具 + docs://guide 资源）

### MCP Client 示例

- `src/demo/mcp-amap.mjs`：MultiServerMCPClient 集成高德地图和 filesystem

### RAG 示例

- `src/demo/loader-and-spliter2.mjs`：网页加载 + 文本切分 + RAG 完整流程
- `src/demo/rag-demo.mjs`：Embedding 配置与健康检查

### 动态内容提取

- `src/demo/loader-and-spliter.mjs`：Puppeteer 抓取掘金文章

### 文本分割器示例

- `src/splitters/CharacterTextSplitter-test.mjs`：基于字符的分割器示例
- `src/splitters/RecursiveCharacterTextSplitter-test.mjs`：递归字符分割器（支持自定义分隔符）
- `src/splitters/TokenTextSplitter-test.mjs`：基于 Token 计数的分割器
- `src/splitters/recursive-splitter-code.mjs`：代码专用分割器（支持 JS 等语言）
- `src/splitters/recursive-splitter-markdown.mjs`：Markdown 文档专用分割器
- `src/splitters/recursive-splitter-latex.mjs`：LaTeX 数学公式专用分割器

### 对话记忆管理示例

**基础存储**

- `src/memory/history-test.mjs`：InMemoryChatMessageHistory 基础用法（内存存储）
- `src/memory/history-test2.mjs`：FileSystemChatMessageHistory 持久化存储（写入文件）
- `src/memory/history-test3.mjs`：从文件恢复历史对话（读取已保存的会话）
- `src/memory/chat_history.json`：FileSystemChatMessageHistory 的存储文件示例

**截断策略**

- `src/memory/truncation-memory.mjs`：消息截断策略（按消息数、按 token 数）

**总结策略**

- `src/memory/summarization-memory.mjs`：基于消息数量的对话总结策略
- `src/memory/summarization-memory2.mjs`：基于 token 数量的对话总结策略（更精确）

**检索策略（RAG）**

- `src/memory/constant.mjs`：集合名称常量定义
- `src/memory/insert-conversations.mjs`：批量插入对话数据到 Milvus 向量数据库
- `src/memory/retrieval-memory.mjs`：完整的 RAG 检索增强生成流程演示
- `src/memory/query-conversations.mjs`：查询 Milvus 中的所有对话记录

### 结构化大模型输出示例

**基础解析（2 个文件）**

- `src/output-parse/normal.mjs`：手动 JSON.parse() 基础演示
- `src/output-parse/json-output-parser.mjs`：JsonOutputParser 智能提取与格式指令

**结构化定义（3 个文件）**

- `src/output-parse/structured-output-parser.mjs`：StructuredOutputParser 字段定义
- `src/output-parse/zod-schema-parser.mjs`：Zod Schema 完整类型系统（嵌套对象、数组、可选字段）
- `src/output-parse/with-structured-output.mjs`：现代 API 一行搞定结构化输出

**流式输出（4 个文件）**

- `src/output-parse/stream-normal.mjs`：普通文本流式输出演示
- `src/output-parse/stream-structured-partial.mjs`：流式接收 + 批量解析（两阶段处理）
- `src/output-parse/stream-tool-calls-raw.mjs`：流式 Tool Calls 原始数据
- `src/output-parse/stream-tool-calls-parser.mjs`：流式 Tool Calls + JsonOutputToolsParser 智能解析

**XML 格式（1 个文件）**

- `src/output-parse/xml-output-parser.mjs`：XML 格式输出解析

### 智能录入与 Mini Cursor Agent 实战示例

**智能数据录入（2 个文件）**

- `src/output-parse-demo/smart-import.mjs`：AI 驱动的非结构化文本提取 + MySQL 批量插入
- `src/output-parse-demo/create-table.mjs`：数据库初始化脚本（建表 + 插入测试数据）

**Mini Cursor Agent（1 个文件）**

- `src/output-parse-demo/mini-cursor.mjs`：简化版 AI 编程助手（ReAct 模式 + 流式工具调用）

**工程化配置（2 个文件）**

- `src/output-parse-demo/constant.mjs`：数据库配置常量提取（连接配置、表结构、SQL 语句）
- `src/output-parse-demo/docker-compose-mysql.yml`：MySQL Docker 服务编排配置

### PromptTemplate 组件化管理示例

**基础模板（1 个文件）**

- `src/prompt-template/prompt-template1.mjs`：PromptTemplate 基础用法、占位符替换

**管道模板（3 个文件）**

- `src/prompt-template/pipeline-prompt-template.mjs`：PipelinePromptTemplate 模块化组合（人设/背景/任务/格式）
- `src/prompt-template/pipeline-prompt-template2.mjs`：OKR 评审场景、模块复用演示
- `src/prompt-template/pipeline-prompt-template3.mjs`：Pipeline + ChatPromptTemplate 组合

**部分应用（1 个文件）**

- `src/prompt-template/partial.mjs`：.partial() 预填充变量、模板工厂模式

**对话模板（2 个文件）**

- `src/prompt-template/chat-prompt-template.mjs`：ChatPromptTemplate 基础用法、system/human 角色
- `src/prompt-template/chat-prompt-template2.mjs`：多轮对话示例

**少样本模板（4 个文件）**

- `src/prompt-template/fewshot-prompt-template.mjs`：FewShotPromptTemplate 基础用法（字符串格式）
- `src/prompt-template/fewshot-chat-prompt-template.mjs`：FewShotChatMessagePromptTemplate（对话格式）
- `src/prompt-template/example-selector1.mjs`：动态选择示例（基础）
- `src/prompt-template/example-selector2.mjs`：基于相似度选择示例（Milvus 检索）

**向量数据库（2 个文件）**

- `src/prompt-template/weekly-report-examples-writer-milvus.mjs`：将周报示例写入 Milvus
- `src/prompt-template/weekly-report-examples-reader-milvus.mjs`：从 Milvus 检索示例

### Runnable - 把写逻辑变成组装 Chain 示例

**基础对比（1 个文件）**

- `src/runnable/before.mjs`：传统方式手动串联 Prompt → Model → OutputParser

**Runnable 基础（1 个文件）**

- `src/runnable/runnable.mjs`：RunnableSequence 串行执行、.pipe() 链式调用

**核心 API（7 个文件）**

- `src/runnable/api-case/RunnableLambda.mjs`：包装自定义函数
- `src/runnable/api-case/RunnableMap.mjs`：并行执行多个任务
- `src/runnable/api-case/RunnableBranch.mjs`：条件分支路由
- `src/runnable/api-case/RunnableRoute.mjs`：RouterRunnable 键值路由
- `src/runnable/api-case/RunnablePassthrough.mjs`：数据直通/赋值
- `src/runnable/api-case/RunnableEach.mjs`：数组遍历处理
- `src/runnable/api-case/RunnablePick.mjs`：字段选择提取

**高级特性（5 个文件）**

- `src/runnable/api-case/RunnableWithRetry.mjs`：失败自动重试（`onFailedAttempt` 回调）
- `src/runnable/api-case/RunnableWithFallbacks.mjs`：备选方案降级机制
- `src/runnable/api-case/RunnableWithConfig.mjs`：配置传递（`configurable` 业务配置）
- `src/runnable/api-case/RunnableWithMessageHistory.mjs`：多轮对话记忆管理
- `src/runnable/api-case/RunnableWithCallbacks.mjs`：回调监听链执行

### Nest + LangChain 流式 AI 接口示例

**核心文件（3 个文件）**

- `src/asr-and-tts-nest-service/src/ai/ai.controller.ts`：SSE 控制器（`@Sse()` 装饰器 + RxJS Observable）
- `src/asr-and-tts-nest-service/src/ai/ai.service.ts`：LangChain Chain 构建 + AsyncGenerator 流式输出
- `src/asr-and-tts-nest-service/src/ai/ai.module.ts`：依赖注入 + ChatOpenAI 工厂提供者

**配置与工具（2 个文件）**

- `src/asr-and-tts-nest-service/src/utils/config.util.ts`：.env 文件自动向上查找策略
- `src/asr-and-tts-nest-service/src/app.module.ts`：应用根模块（ConfigModule + ServeStaticModule + AiModule）

**前端页面（1 个文件）**

- `src/asr-and-tts-nest-service/public/index.html`：SSE 测试页面（EventSource API + 状态指示 + 实时渲染）

### Nest + Tool Calling AI 智能助手示例

**核心文件（4 个文件）**

- `src/cron-job-tool/src/ai/ai.controller.ts`：AI 控制器（普通响应 + SSE 流式两个端点）
- `src/cron-job-tool/src/ai/ai.service.ts`：ReAct 循环核心（工具调度 + 流式混合输出）
- `src/cron-job-tool/src/ai/ai.module.ts`：工厂提供者（ChatOpenAI + 三个工具定义）
- `src/cron-job-tool/src/ai/user.service.ts`：用户数据服务（Map 内存数据库 + CRUD）

**配置与工具（2 个文件）**

- `src/cron-job-tool/src/utils/config.util.ts`：.env 文件自动向上查找策略
- `src/cron-job-tool/src/app.module.ts`：应用根模块（ConfigModule + MailerModule + AiModule）

### 流程图

- `src/mco-amap-flow.md`：MCP Agent 调用流程图和时序图

## 项目结构

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
│   ├── tool-runner.mjs         # 工具调用循环
│   └── tools/                  # 本地工具实现
└── react-todo-app/             # Agent 生成的 React Todo 示例项目
```

## 环境要求

- Node.js 18+
- pnpm
- 一个可用的 OpenAI 兼容模型服务

## 安装依赖

在仓库根目录执行：

```bash
pnpm install
```

如果你也想单独运行前端示例，再进入子项目安装一次：

```bash
cd react-todo-app
pnpm install
```

## 环境变量

根目录 `.env` 需要提供：

```bash
MODEL=your-model-name
API_KEY=your-api-key
BASE_URL=https://your-openai-compatible-endpoint
```

说明：

- `MODEL`：模型名称
- `API_KEY`：接口密钥
- `BASE_URL`：OpenAI 兼容接口地址

如果你要运行高德地图 MCP 示例，还需要：

```bash
AMAP_MAPS_API_KEY=your-amap-key
ALLOWED_PATHS=/absolute/path/one,/absolute/path/two
```

说明：

- `AMAP_MAPS_API_KEY`：高德地图 MCP 服务使用的 Key
- `ALLOWED_PATHS`：filesystem MCP 可访问的绝对路径列表，多个路径用英文逗号分隔

如果你要运行向量检索示例，还可以额外提供：

```bash
EMBEDDINGS_BASE_URL=https://your-embeddings-endpoint
EMBEDDINGS_API_KEY=your-embeddings-key
EMBEDDINGS_MODEL=text-embedding-3-small
```

如果不提供 `EMBEDDINGS_*`，当前示例会优先回退到 `API_KEY / BASE_URL`，再不行就自动降级为关键词检索。

��果你要运行 Nest + Tool Calling AI 智能助手示例的互联网搜索功能，还需要配置 Bocha API Key：

```bash
BOCHA_API_KEY=your-bocha-api-key
```

说明：

- `BOCHA_API_KEY`：Bocha Web Search API 密钥（用于互联网搜索工具）

如果你要运行 Nest + Tool Calling AI 智能助手示例的邮件发送功能，还需要配置 SMTP 信息：

```bash
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@example.com
MAIL_PASS=your-password
MAIL_FROM=your-email@example.com
```

说明：

- `MAIL_HOST`：SMTP 服务器地址
- `MAIL_PORT`：SMTP 端口（465=SSL, 587=TLS）
- `MAIL_SECURE`：是否使用 SSL（true/false）
- `MAIL_USER`：SMTP 用户名
- `MAIL_PASS`：SMTP 密码
- `MAIL_FROM`：发件人邮箱地址

如果不提供 `BOCHA_API_KEY`，AI 会在调用搜索工具时返回"API Key 未配置"的提示。

如果你要运行智能录入与 Mini Cursor Agent 示例，还需要配置数据库环境变量：

```bash
# 在 src/output-parse-demo/.env 中配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root123456
DB_NAME=hello
```

说明：

- `DB_HOST`：MySQL 服务器地址（默认 localhost）
- `DB_PORT`：MySQL 端口（默认 3306）
- `DB_USER`：数据库用户名
- `DB_PASSWORD`：数据库密码
- `DB_NAME`：数据库名称

如果使用 Docker Compose 启动 MySQL，密码应与 `docker-compose-mysql.yml` 中的 `MYSQL_ROOT_PASSWORD` 一致。

## 如何运行

### 运行 Agent 示例

执行：

```bash
node agent-react-todo.mjs
```

它会调用 `src/agent-react-todo.mjs` 中的中文任务描述，让模型尝试完成下面这些事：

- 创建一个 React + TypeScript + Vite 项目
- 实现 TodoList 的增删改查、筛选和统计
- 添加样式与动画
- 安装依赖并启动开发服务器

### 使用 MCP Server 示例

这个 Server 采用 `stdio` 通信，通常不是你在终端里手动交互，而是由 MCP Client 启动，例如 Cursor、Claude Desktop 或其他支持 MCP 的工具。

如果你直接运行：

```bash
node src/mcp-server.mjs
```

进程通常会保持等待状态，这是正常的，因为它在等待 MCP Client 通过标准输入输出与它通信。

如果某个客户端支持通过命令注册 MCP Server，通常可以配置成下面这样：

```json
{
  "mcpServers": {
    "demo-agent": {
      "command": "node",
      "args": ["/path/to/demo-agent/src/mcp-server.mjs"]
    }
  }
}
```

启动后，你可以让客户端尝试类似请求：

- `查询用户 001 的信息`
- `读取 docs://guide 这个资源`
- `查询用户 999 的信息`

当前示例内置的可查询用户 ID 为：`001`、`002`、`003`。

你也可以把这部分当成一个小练习：

1. 先查询一个存在的用户，观察工具返回内容
2. 再查询一个不存在的用户，观察错误提示怎么返回
3. 再读取 `docs://guide`，感受 Resource 和 Tool 的区别

### 运行地图 + filesystem MCP Agent 示例

执行：

```bash
node src/mcp-amap.mjs "请列出 /Users/chenkun/Desktop 下的前几个文件，如果工具结果不足以支持结论，请明确说明不确定。"
```

或者：

```bash
node src/mcp-amap.mjs "查一下北京南站三公里附近的酒店，如果工具结果不足以支持结论，请明确说明不确定。"
```

这个示例适合重点观察：

- 模型会不会先选对工具
- filesystem 工具是否只能访问 `ALLOWED_PATHS` 里声明过的目录
- 当工具结果不足时，模型是否会明确说“不确定”

### 运行 RAG 示例

执行：

```bash
node src/loader-and-spliter2.mjs
```

这个示例会：

- 抓取一篇网页文章
- 切分文本
- 尝试建立向量检索
- embeddings 不可用时自动切换为关键词检索
- 最后基于检索到的片段回答问题

如果你只想测试 embeddings 配置是否可用，也可以看 `src/rag-demo.mjs`。

### 运行对话记忆管理示例

**1. 测试内存存储（InMemoryChatMessageHistory）**

```bash
node src/memory/history-test.mjs
```

这个示例会：

- 在内存中创建对话历史
- 演示两轮对话的完整流程
- 展示所有历史消息的保存情况
- 适合理解 LangChain 消息管理的基础概念

**2. 测试文件持久化（FileSystemChatMessageHistory）**

```bash
node src/memory/history-test2.mjs
```

这个示例会：

- 将对话历史保存到 `src/memory/chat_history.json`
- 演示多轮对话的持久化存储
- 可以在运行后查看 JSON 文件了解存储格式

**3. 测试历史恢复**

```bash
node src/memory/history-test3.mjs
```

这个示例会：

- 从 `chat_history.json` 文件加载之前的对话
- 展示恢复后的历史消息
- 继续在恢复的对话基础上进行新对话

**4. 测试消息截断策略**

```bash
node src/memory/truncation-memory.mjs
```

这个示例会：

- 演示按消息数量截断（保留最近 N 条消息）
- 演示按 token 数量截断（使用 `trimMessages` API）
- 使用 `js-tiktoken` 精确计算 token 数

**5. 测试基于消息数量的总结**

```bash
node src/memory/summarization-memory.mjs
```

这个示例会：

- 当消息数量超过阈值时触发总结
- 保留最近的 2 条消息
- 调用 AI 模型总结旧对话的核心内容

**6. 测试基于 token 数量的总结（更精确）**

```bash
node src/memory/summarization-memory2.mjs
```

这个示例会：

- 使用 `cl100k_base` 编码器计算 token 数
- 当总 token 数超过 200 时触发总结
- 保留最近约 80 个 token 的消息（约占 40%）
- 逆向遍历算法：从最新消息开始保留，确保上下文连贯

**7. 测试检索策略 - 数据准备（Milvus 向量数据库）**

⚠️ **前置条件**：需要先启动 Milvus 服务

```bash
node src/memory/insert-conversations.mjs
```

这个示例会：

- 连接到本地 Milvus 向量数据库（localhost:19530）
- 创建 `conversations` 集合（包含 id、vector、content、round、timestamp 字段）
- 创建 IVF_FLAT 索引，使用 COSINE 相似度度量
- 批量插入 5 条测试对话数据
- 使用 Embeddings 模型将对话文本转换为 1024 维向量

**8. 测试检索策略 - RAG 完整流程**

```bash
node src/memory/retrieval-memory.mjs
```

这个示例会：

- 演示完整的 RAG（检索增强生成）流程
- 针对 3 个测试问题，依次执行：
  1. **检索**：将问题向量化，从 Milvus 检索最相似的 2 条历史对话
  2. **增强**：将检索到的历史对话作为上下文构建 prompt
  3. **生成**：调用 AI 模型生成回答
  4. **入库**：将新对话向量化后存入 Milvus，形成闭环
- 显示每条检索结果的相似度分数（score）

**9. 测试检索策略 - 查询所有记录**

```bash
node src/memory/query-conversations.mjs
```

这个示例会：

- 查询 Milvus 集合中的所有对话记录
- 显示每条记录的完整信息（ID、轮次、时间、内容）
- 适合验证数据插入和检索结果

### 运行结构化大模型输出示例

**1. 基础解析**

```bash
node src/output-parse/normal.mjs
```

这个示例会：

- 演示最基础的模型调用和 JSON 解析
- 使用 `JSON.parse()` 手动解析 AI 返回的 JSON 字符串
- 适合理解结构化输出的基础原理

**2. JsonOutputParser 智能提取**

```bash
node src/output-parse/json-output-parser.mjs
```

这个示例会：

- 使用 `JsonOutputParser` 自动提取和解析 JSON
- 通过 `getFormatInstructions()` 自动生成格式指令
- 比手动解析更鲁棒，能处理 AI 的额外文字

**3. StructuredOutputParser 字段定义**

```bash
node src/output-parse/structured-output-parser.mjs
```

这个示例会：

- 使用 `fromNamesAndDescriptions()` 定义字段名和描述
- 生成包含字段说明的详细格式指令
- 保证字段完整性（所有字段必填）

**4. Zod Schema 完整类型系统**

```bash
node src/output-parse/zod-schema-parser.mjs
```

这个示例会：

- 使用 Zod 定义复杂嵌套结构（对象、数组、可选字段）
- 演示完整的类型系统（string、number、array、object）
- 自动类型校验，失败时抛出 ZodError

**5. withStructuredOutput 现代 API**

```bash
node src/output-parse/with-structured-output.mjs
```

这个示例会：

- 使用 `model.withStructuredOutput(schema)` 一行搞定结构化输出
- 自动完成格式指令注入、解析、验证
- 生产环境推荐的最佳实践

**6. 普通文本流式输出**

```bash
node src/output-parse/stream-normal.mjs
```

这个示例会：

- 演示 `model.stream()` 的流式调用
- 使用 `for await...of` 遍历异步数据流
- 实现打字机效果实时显示

**7. 流式 + 结构化（两阶段处理）**

```bash
node src/output-parse/stream-structured-partial.mjs
```

这个示例会：

- 流式接收 AI 返回的 JSON 字符串
- 累积完整内容后批量解析
- 展示两阶段处理模式

**8. 流式 Tool Calls 原始数据**

```bash
node src/output-parse/stream-tool-calls-raw.mjs
```

这个示例会：

- 使用 `bindTools()` 绑定工具定义
- 流式接收 `tool_call_chunks` 原始数据
- 直接打印 JSON 参数片段

**9. 流式 Tool Calls 智能解析**

```bash
node src/output-parse/stream-tool-calls-parser.mjs
```

这个示例会：

- 使用 `JsonOutputToolsParser` 自动解析工具调用
- 通过 `.pipe()` 连接模型和解析器
- 演示增量 diff 显示算法

**10. XML 格式输出**

```bash
node src/output-parse/xml-output-parser.mjs
```

这个示例会：

- 使用 `XMLOutputParser` 处理 XML 格式输出
- 生成 XML 格式指令
- 解析 XML 为 JavaScript 对象

### 运行 Nest + LangChain 流式 AI 接口示例

⚠️ **前置条件**：需要先在根目录 `.env` 中配置 `MODEL`、`API_KEY`、`BASE_URL`

**1. 安装依赖**

```bash
cd src/asr-and-tts-nest-service
pnpm install
```

**2. 启动开发服务器**

```bash
pnpm start:dev
```

这个示例会：

- 启动 NestJS 服务（默认监听 3000 端口）
- 自动向上查找 `.env` 文件加载环境变量
- 注册 SSE 流式聊天端点 `GET /ai/chat/stream?query=xxx`
- 托管静态前端测试页面到根路径

**3. 打开测试页面**

浏览器访问 `http://localhost:3000`，页面提供：

- 输入框填写问题内容
- 点击「开始流式请求」建立 SSE 连接
- 实时显示 AI 响应内容（打字机效果）
- 连接状态指示（连接中/已连接/已断开）
- 支持手动停止请求

**4. 直接测试 SSE 端点**

也可以用 curl 测试：

```bash
curl -N "http://localhost:3000/ai/chat/stream?query=什么是NestJS"
```

### 运行 Nest + Tool Calling AI 智能助手示例

⚠️ **前置条件**：需要先在根目录 `.env` 中配置 `MODEL`、`API_KEY`、`BASE_URL`

**1. 安装依赖**

```bash
cd src/cron-job-tool
pnpm install
```

> ⚠️ **注意**：发送邮件功能需要额外安装 `@nestjs-modules/mailer`：
>
> ```bash
> pnpm add @nestjs-modules/mailer
> ```
>
> 并在 `.env` 中配置 `MAIL_HOST`、`MAIL_PORT`、`MAIL_USER`、`MAIL_PASS`、`MAIL_FROM`

**2. 启动开发服务器**

```bash
pnpm start:dev
```

**3. 测试普通问答**

```bash
curl "http://localhost:3000/ai/chat?query=什么是NestJS"
```

这个示例会：

- 启动 NestJS 服务（默认监听 3000 端口）
- 注册普通聊天端点 `GET /ai/chat?query=xxx`（一次性返回 JSON）
- 注册流式聊天端点 `GET /ai/chat/stream?query=xxx`（SSE 实时推送）
- AI 可根据问题自主选择调用工具

**4. 测试工具调用 — 查询用户**

```bash
curl "http://localhost:3000/ai/chat?query=查询用户001的信息"
```

这个示例会：

- AI 识别需要调用 `query_user` 工具
- 查询内存数据库中三国人物的信息（赵云、诸葛亮、关羽等）
- 返回格式化后的用户信息

**5. 测试工具调用 — 互联网搜索**

⚠️ **前置条件**：需要在 `.env` 中配置 `BOCHA_API_KEY`（Bocha Web Search API Key）

```bash
curl "http://localhost:3000/ai/chat?query=帮我搜索一下今天的人工智能新闻"
```

这个示例会：

- AI 识别需要调用 `web_search` 工具
- 调用 Bocha API 搜索互联网
- 返回结构化的搜索结果（标题、URL、摘要、来源）

**6. 测试流式工具调用**

```bash
curl -N "http://localhost:3000/ai/chat/stream?query=查询用户003的信息"
```

这个示例会：

- 以 SSE 流式方式输出 AI 回答
- 如果 AI 决定调用工具，流式输出会暂停，执行工具后继续输出
- 最终用户看到的是连续的流式回答体验

### 运行 PromptTemplate 组件化管理示例

**基础模板**

```bash
node src/prompt-template/prompt-template1.mjs
```

这个示例会：

- 演示 PromptTemplate 基础用法
- 使用占位符 `{variable}` 定义模板
- 调用 `.format()` 填入变量生成提示词

**管道模板**

```bash
node src/prompt-template/pipeline-prompt-template.mjs
```

这个示例会：

- 使用 PipelinePromptTemplate 组合 4 个模块（人设/背景/任务/格式）
- 演示模块导出与复用（personaPrompt、contextPrompt）
- 一次传入所有变量，Pipeline 自动分发到子模板

```bash
node src/prompt-template/pipeline-prompt-template3.mjs
```

这个示例会：

- 将 PipelinePromptTemplate 与 ChatPromptTemplate 组合
- finalPrompt 使用对话格式（system + human）
- 使用 `.formatPromptValue()` 生成消息数组

**部分应用**

```bash
node src/prompt-template/partial.mjs
```

这个示例会：

- 使用 `.partial()` 预填充不变的变量（公司信息、价值观）
- 基于预配置模板多次调用 `.format()` 填入变化的变量
- 演示模板工厂模式

**对话模板**

```bash
node src/prompt-template/chat-prompt-template.mjs
```

这个示例会：

- 使用 ChatPromptTemplate 定义多角色对话
- system 消息设定角色，human 消息提供数据
- 调用 `.formatMessages()` 生成消息数组
- 直接传给 `model.invoke()` 调用模型

**少样本模板**

```bash
node src/prompt-template/fewshot-prompt-template.mjs
```

这个示例会：

- 使用 FewShotPromptTemplate 提供示例指导
- 定义示例模板（examplePrompt）和示例数据（examples）
- 通过示例让 AI 学习语气、结构和信息组织方式

```bash
node src/prompt-template/fewshot-chat-prompt-template.mjs
```

这个示例会：

- 使用 FewShotChatMessagePromptTemplate 在对话中插入示例
- 每条示例展开为 HumanMessage + AIMessage
- 流式调用模型并实时输出

**向量数据库操作**

⚠️ **前置条件**：需要先启动 Milvus 服务

```bash
# 1. 写入示例到 Milvus
node src/prompt-template/weekly-report-examples-writer-milvus.mjs
```

这个示例会：

- 定义 8 个不同场景的周报示例
- 使用 Embedding 模型将文本转换为 1024 维向量
- 在 Milvus 中创建集合和索引
- 批量插入示例数据（包含向量）

```bash
# 2. 从 Milvus 检索示例
node src/prompt-template/weekly-report-examples-reader-milvus.mjs
```

这个示例会：

- 根据用户输入生成查询向量
- 在 Milvus 中检索最相似的示例
- 演示语义检索的应用

### 运行智能录入与 Mini Cursor Agent 示例

**前置准备：启动 MySQL 服务**

```bash
# 使用 Docker Compose 启动 MySQL
docker-compose -f src/output-parse-demo/docker-compose-mysql.yml up -d

# 查看服务状态
docker-compose -f src/output-parse-demo/docker-compose-mysql.yml ps
```

**1. 初始化数据库（建表 + 插入测试数据）**

```bash
node src/output-parse-demo/create-table.mjs
```

这个示例会：

- 连接到 MySQL 数据库（使用 `.env` 中的配置）
- 创建 `friends` 表（包含姓名、性别、出生日期、公司、职位、手机、微信等字段）
- 批量插入 2 条测试数据（王经理、李总监）
- 使用事务保证数据一致性

**2. 测试智能数据录入（AI 文本提取 + 数据库插入）**

```bash
node src/output-parse-demo/smart-import.mjs
```

这个示例会：

- 读取包含多人信息的自然语言文本
  - 例如："张总，女的，30 出头，在腾讯做技术总监，手机 13800138000..."
- 使用 Zod Schema 定义数据结构
- 调用 `withStructuredOutput()` 让 AI 提取结构化信息
- 将提取的结果批量插入 MySQL 数据库
- 显示提取和插入的详细信息

**3. 测试 Mini Cursor Agent（AI 自主完成任务）**

```bash
node src/output-parse-demo/mini-cursor.mjs
```

这个示例会：

- 接收复杂的任务描述（如"创建一个 React TodoList 应用"）
- AI 自主决策并调用工具完成任务：
  - `command-execute`：执行命令（创建项目、安装依赖、启动服务器）
  - `file-write`：写入文件（编写 React 组件代码）
  - `file-read`：读取文件（查看现有代码）
  - `directory-list`：列出目录（确认项目结构）
- 流式显示文件写入过程（增量 diff 算法）
- 最多 30 轮循环自主完成任务
- 返回最终执行结果

## Agent 内置工具说明

当前 Agent 示例挂载了 4 个本地工具：

- `file-read`：读取文件内容
- `file-write`：写入文件，自动创建目录
- `directory-list`：列出目录内容
- `command-execute`：执行系统命令，可指定 `workingDirectory`

其中 `command-execute` 的设计重点是：目录切换通过 `workingDirectory` 控制，而不是在命令字符串里手动写 `cd xxx && ...`。

这也是一个很适合学习的点：提示词设计会直接影响 Agent 是否能稳定调用工具。

## Agent 和 MCP 怎么区分

可以先用一个很粗的理解方式：

- `Agent`：你在应用内部主动把工具交给模型，模型在一次任务流程里自主决策怎么调用
- `MCP`：你把能力做成标准服务，由外部 MCP Client 接入、发现和调度

这个仓库把两种方式都放在一起，正好适合对比学习：

- 如果你想理解“模型如何在多轮中调用本地工具”，先看 Agent
- 如果你想理解“能力如何以协议形式提供给外部客户端”，先看 MCP Server

两条路线都在做“给模型能力”，但抽象层级和接入位置不一样。

再往前走一步可以这样理解：

- `MCP Server`：暴露能力
- `MCP Client`：发现并连接这些能力
- `Agent`：拿到这些能力后，决定什么时候用、怎么组合使用

`src/mcp-amap.mjs` 就是一个很直接的例子：它自己不是工具提供方，而是“工具使用方”。

## react-todo-app 说明

`react-todo-app/` 是当前仓库自带的示例产物，方便你直接查看 Agent 最终生成了什么。它当前包含：

- 添加、删除、编辑待办事项
- 完成状态切换
- 按全部 / 进行中 / 已完成筛选
- 任务统计
- 基于 `localStorage` 的本地持久化
- 基础界面样式和过渡动画

如果你想单独启动它：

```bash
cd react-todo-app
pnpm install
pnpm dev
```

`react-todo-app/README.md` 仍然是 Vite 默认内容，阅读这个仓库时优先看根目录 `README.md` 即可。

## 推荐学习顺序

如果你是第一次接触这类项目，建议按这个顺序看：

1. 先看 `src/mcp-server.mjs`，理解 MCP Server 最小结构
2. 再看 `src/tools/`，理解本地工具是怎么封装的
3. 然后看 `src/tool-runner.mjs`，理解工具调用循环
4. 最后看 `src/index.mjs` 和 `src/agent-react-todo.mjs`，理解 Agent 如何接任务并驱动整个流程

**对话记忆管理学习路径**：

如果是第一次学习记忆管理，建议按这个顺序：

**基础存储（3 个文件）**

1. **内存存储**：`src/memory/history-test.mjs` - 理解 InMemoryChatMessageHistory
2. **文件持久化**：`src/memory/history-test2.mjs` - 学习 FileSystemChatMessageHistory
3. **历史恢复**：`src/memory/history-test3.mjs` - 理解会话恢复机制

**截断策略（1 个文件）** 4. **消息截断**：`src/memory/truncation-memory.mjs` - 掌握按消息数/token 数截断

**总结策略（2 个文件）** 5. **消息数总结**：`src/memory/summarization-memory.mjs` - 学习基于消息数量的总结 6. **Token 级总结**：`src/memory/summarization-memory2.mjs` - 理解更精确的 token 级别管理

**检索策略 - RAG（4 个文件，需先启动 Milvus）** 7. **常量定义**：`src/memory/constant.mjs` - 了解集合名称配置 8. **数据插入**：`src/memory/insert-conversations.mjs` - 批量导入对话到向量数据库 9. **RAG 流程**：`src/memory/retrieval-memory.mjs` - 完整的检索-增强-生成-入库闭环10. **数据查询**：`src/memory/query-conversations.mjs` - 查看向量数据库中的所有记录

**结构化大模型输出学习路径**：

如果是第一次学习结构化输出，建议按这个顺序：

**基础解析（2 个文件）**

1. **手动解析**：`src/output-parse/normal.mjs` - 理解 JSON.parse() 基础原理
2. **智能提取**：`src/output-parse/json-output-parser.mjs` - 学习 JsonOutputParser

**结构化定义（3 个文件）**

3. **字段定义**：`src/output-parse/structured-output-parser.mjs` - 理解 StructuredOutputParser
4. **Zod Schema**：`src/output-parse/zod-schema-parser.mjs` - 掌握完整类型系统
5. **现代 API**：`src/output-parse/with-structured-output.mjs` - 学习生产级最佳实践

**流式输出（4 个文件）**

6. **普通流式**：`src/output-parse/stream-normal.mjs` - 理解流式调用基础
7. **流式 + 结构化**：`src/output-parse/stream-structured-partial.mjs` - 学习两阶段处理
8. **Tool Calls 原始**：`src/output-parse/stream-tool-calls-raw.mjs` - 了解工具调用机制
9. **Tool Calls 解析**：`src/output-parse/stream-tool-calls-parser.mjs` - 掌握智能解析

**XML 格式（1 个文件）**

10. **XML 解析**：`src/output-parse/xml-output-parser.mjs` - 了解 XML 格式处理

**PromptTemplate 组件化管理学习路径**：

如果是第一次学习提示词组件化，建议按这个顺序：

**基础模板（1 个文件）**

1. **基础用法**：`src/prompt-template/prompt-template1.mjs` - 理解 PromptTemplate 和占位符替换

**管道模板（3 个文件）**

2. **模块化组合**：`src/prompt-template/pipeline-prompt-template.mjs` - 学习 PipelinePromptTemplate 组合多个模块
3. **模块复用**：`src/prompt-template/pipeline-prompt-template2.mjs` - 理解导入复用其他文件的模块
4. **对话组合**：`src/prompt-template/pipeline-prompt-template3.mjs` - 掌握 Pipeline + ChatPromptTemplate 组合

**部分应用（1 个文件）**

5. **预填充变量**：`src/prompt-template/partial.mjs` - 学习 .partial() 创建可复用模板

**对话模板（2 个文件）**

6. **多角色对话**：`src/prompt-template/chat-prompt-template.mjs` - 理解 ChatPromptTemplate 和消息格式
7. **多轮对话**：`src/prompt-template/chat-prompt-template2.mjs` - 学习多轮对话历史管理

**少样本模板（4 个文件）**

8. **字符串示例**：`src/prompt-template/fewshot-prompt-template.mjs` - 理解 FewShotPromptTemplate 基础
9. **对话示例**：`src/prompt-template/fewshot-chat-prompt-template.mjs` - 学习 FewShotChatMessagePromptTemplate
10. **动态选择**：`src/prompt-template/example-selector1.mjs` - 掌握动态示例选择
11. **语义检索**：`src/prompt-template/example-selector2.mjs` - 理解基于相似度的示例选择

**向量数据库（2 个文件，需先启动 Milvus）**

12. **写入示例**：`src/prompt-template/weekly-report-examples-writer-milvus.mjs` - 学习向量存储
13. **检索示例**：`src/prompt-template/weekly-report-examples-reader-milvus.mjs` - 掌握语义检索

**Nest + LangChain 流式 AI 接口学习路径**：

如果是第一次学习 NestJS + LangChain 集成，建议按这个顺序：

**环境准备（1 步）**

1. **安装依赖**：进入 `src/asr-and-tts-nest-service/` 执行 `pnpm install`

**后端核心（3 个文件，按数据流顺序阅读）**

2. **Chain 构建**：`src/asr-and-tts-nest-service/src/ai/ai.service.ts` - 理解 LangChain Chain 的组装和流式输出
3. **SSE 端点**：`src/asr-and-tts-nest-service/src/ai/ai.controller.ts` - 学习 `@Sse()` 装饰器和 Observable 转换
4. **依赖注入**：`src/asr-and-tts-nest-service/src/ai/ai.module.ts` - 理解 NestJS 工厂提供者模式

**配置与基础设施（2 个文件）**

5. **环境变量**：`src/asr-and-tts-nest-service/src/utils/config.util.ts` - 学习 .env 自动查找策略
6. **根模块**：`src/asr-and-tts-nest-service/src/app.module.ts` - 理解模块编排和静态资源托管

**前端交互（1 个文件）**

7. **测试页面**：`src/asr-and-tts-nest-service/public/index.html` - 掌握 EventSource API 的使用

**Nest + Tool Calling AI 智能助手学习路径**：

如果是第一次学习 ReAct 循环和工具调用，建议按这个顺序：

**环境准备（1 步）**

1. **安装依赖**：进入 `src/cron-job-tool/` 执行 `pnpm install`

**数据层（1 个文件）**

2. **用户服务**：`src/cron-job-tool/src/ai/user.service.ts` - 理解 Map 内存数据库和 CRUD

**工具注册（1 个文件，核心）**

3. **模块与工具**：`src/cron-job-tool/src/ai/ai.module.ts` - 学习三个 LangChain 工具的工厂定义、Zod 参数校验、MailerService 注入

**ReAct 循环（1 个文件，核心）**

4. **非流式版本**：`src/cron-job-tool/src/ai/ai.service.ts` 的 `runChain()` - 理解 while(true) 自循环逻辑
5. **流式版本**：`src/cron-job-tool/src/ai/ai.service.ts` 的 `runChainStream()` - 学习 tool_call_chunks 检测

**控制器（1 个文件）**

6. **API 端点**：`src/cron-job-tool/src/ai/ai.controller.ts` - 理解普通响应和 SSE 两个端点的分工

**根模块（1 个文件）**

7. **应用配置**：`src/cron-job-tool/src/app.module.ts` - 理解 MailerModule 异步配置

**智能录入与 Mini Cursor Agent（3 个文件，需先启动 MySQL）**

如果是第一次学习实战应用，建议按这个顺序：

**环境准备**

1. **启动 MySQL**：使用 Docker Compose 启动数据库服务
2. **配置环境变量**：在 `.env` 中配置数据库连接信息
3. **初始化数据库**：`src/output-parse-demo/create-table.mjs` - 建表并插入测试数据

**智能数据录入**

4. **AI 文本提取**：`src/output-parse-demo/smart-import.mjs` - 学习非结构化文本到结构化数据的完整流程
5. **理解 Schema**：回顾 `src/output-parse/zod-schema-parser.mjs` - 理解 Zod Schema 的定义方式
6. **批量插入**：观察 `smart-import.mjs` 中的批量插入语法和事务处理

**Mini Cursor Agent**

7. **Agent 循环**：`src/output-parse-demo/mini-cursor.mjs` - 理解 ReAct 模式的完整实现
8. **流式处理**：重点学习流式工具调用解析和增量 diff 显示算法
9. **消息历史**：理解 InMemoryChatMessageHistory 的作用和多轮对话管理
10. **工具绑定**：对比 `bindTools()` 和第 9 章的工具调用机制

**工程化配置**

11. **配置提取**：`src/output-parse-demo/constant.mjs` - 学习配置解耦的最佳实践
12. **Docker 编排**：`src/output-parse-demo/docker-compose-mysql.yml` - 理解容器化部署

## 建议动手练习

如果你想把这次新增内容真正学进去，可以直接做下面这些小练习：

### MCP 相关练习

1. 在 `src/mcp-server.mjs` 里新增一个 `list_users` 工具，返回所有用户 ID 和姓名
2. 给 `query_user` 增加更多字段，比如部门、手机号或创建时间
3. 新增一个资源，比如 `docs://users`，专门说明当前有哪些用户数据
4. 把内存数据库拆到单独文件里，感受代码组织方式的变化
5. 对照 `src/tool-runner.mjs`，思考 Agent 的工具调用循环和 MCP 的调用方式有什么本质差异

### 对话记忆管理练习

**基础存储与截断**

1. 修改 `summarization-memory2.mjs`，将生成的摘要也添加回历史记录（目前只计算但未保存）
2. 实现分级总结策略：旧消息总结多次，每次越来越精简
3. 给 `truncation-memory.mjs` 增加系统提示词保留功能（SystemMessage 始终不被截断）
4. 实现一个混合策略：优先按 token 数，但最少保留 N 条消息
5. 尝试使用 `ConversationSummaryMemory`（LangChain 内置）对比自定义实现
6. 给 FileSystemChatMessageHistory 增加多会话管理（不同 sessionId 的切换）

**检索策略 - RAG** 7. 修改 `insert-conversations.mjs`，批量插入 100 条对话数据，观察性能变化 8. 调整 `retrieval-memory.mjs` 中的 k 值（检索数量），对比 k=1、k=3、k=5 的回答质量 9. 给检索增加过滤条件，如只检索最近 3 轮的对话（`filter: 'round >= 3'`）10. 实现动态 k 值：根据问题类型自动调整检索数量 11. 添加检索结果的缓存层（Redis），避免重复查询相同问题 12. 对比不同相似度度量方式（COSINE vs L2 vs IP）的检索效果差异

### Milvus 向量数据库练习

**基础操作** 13. 修改 `insert.mjs`，为 AI 日记增加地理位置字段（location），支持基于地点的过滤检索 14. 尝试不同的索引类型（IVF_SQ8、HNSW），对比检索性能和准确率差异 15. 实现日记的更新和删除操作，理解 Milvus 的数据管理 16. 给 `insert.mjs` 增加批量导入功能，从 JSON 文件读取 100 条日记数据

### 电子书 RAG 系统练习

**电子书处理** 17. 修改 `ebook-writer.mjs`，支持 PDF 格式电子书（使用 PDFLoader）18. 优化章节切分策略：尝试不同的 chunkSize（300、800、1000），对比检索效果 19. 为电子书增加段落级别的细粒度切分，实现更精准的引用定位 20. 实现多本书籍的并行导入，通过 book_id 区分不同书籍

**检索与问答** 21. 在 `ebook-reader-rag.mjs` 中增加引用来源标注（回答时标明出自第几章）22. 实现跨章节检索：先定位相关章节，再在该章节内进行二次检索 23. 给问答系统增加对话历史，支持多轮追问（如"他还会什么？"）24. 对比不同 Embeddings 模型的检索质量（尝试不同的 embedding 模型）25. 实现混合检索：向量检索 + 关键词检索（章节号、角色名精确匹配）

这几个练习都不大，但非常适合建立对 MCP 和 Agent 的直觉。

### 智能录入与 Mini Cursor Agent 练习

**智能数据录入**

1. 修改 `smart-import.mjs` 的测试文本，尝试提取 5 个人的信息并批量插入
2. 在 `friendSchema` 中添加新字段（如邮箱、地址、头像 URL），观察 AI 的提取能力
3. 实现错误重试机制：当 AI 提取失败时自动重试最多 3 次
4. 添加流式输出：使用 `model.stream()` 实时显示 AI 的提取过程
5. 实现数据验证：在插入前用 Zod Schema 验证 AI 返回的数据格式
6. 对比不同模型的提取准确率（qwen-max vs qwen-plus vs qwen-turbo）

**Mini Cursor Agent**

7. 添加新工具：实现 `search-file` 工具（在目录中搜索文件）
8. 添加工具调用日志：记录每个工具的执行时间和结果
9. 实现最大循环警告：当接近 30 次循环时打印警告信息
10. 添加任务超时机制：超过 5 分钟自动终止任务
11. 实现工具调用并行化：让 AI 可以同时调用多个不依赖的工具
12. 添加任务进度显示：实时显示当前是第几轮循环、执行了什么工具

**工程化配置**

13. 将 `.env` 配置改为支持多个数据库环境（开发、测试、生产）
14. 在 `docker-compose-mysql.yml` 中添加数据卷备份策略
15. 实现数据库迁移脚本：支持表结构的版本管理
16. 添加健康检查：在脚本启动前自动检测 MySQL 服务是否可用
17. 实现数据库连接池：支持并发查询场景
18. 添加性能监控：记录每次数据库操作的耗时

### PromptTemplate 组件化管理练习

**基础模板**

1. 修改 `prompt-template1.mjs`，创建一个新的周报模板，添加更多占位符
2. 实现模板缓存机制，避免重复创建相同的 PromptTemplate
3. 对比字符串拼接和 PromptTemplate 的优劣

**管道模板**

4. 在 `pipeline-prompt-template.mjs` 中添加第 5 个模块（如风险评估模块）
5. 创建日报模板，复用人设和背景模块（personaPrompt、contextPrompt）
6. 实现模板配置文件（JSON），动态加载模块定义
7. 对比单个大模板和管道模板的维护成本
8. 实现模板版本管理（v1/v2/v3 的平滑切换）

**部分应用**

9. 使用 `.partial()` 创建多公司模板工厂函数
10. 实现模板缓存：相同的 .partial() 调用返回相同实例
11. 对比 .partial() 和直接传入所有变量的性能差异
12. 实现动态 .partial()：从数据库加载预设配置

**对话模板**

13. 在 `chat-prompt-template.mjs` 中添加 assistant 消息（多轮对话）
14. 实现对话历史管理（MessagesPlaceholder 动态插入）
15. 对比 PromptTemplate 和 ChatPromptTemplate 的适用场景
16. 创建对话模板工厂函数，支持不同角色设定

**少样本模板**

17. 在 `fewshot-prompt-template.mjs` 中添加第 3 条示例
18. 实现动态示例：根据用户输入选择不同的示例集
19. 对比 FewShotPromptTemplate 和 FewShotChatMessagePromptTemplate
20. 实现示例质量评估：记录哪些示例最有效

**向量检索**

21. 修改 `weekly-report-examples-writer-milvus.mjs`，添加 10 条新示例
22. 调整检索参数（k 值、相似度阈值），对比检索效果
23. 实现混合检索：向量检索 + 关键词过滤
24. 添加示例更新机制：支持增删改 Milvus 中的示例

### Nest + LangChain 流式 AI 接口练习

**SSE 端点**

1. 修改 `ai.controller.ts`，添加 POST 方式的 SSE 端点（支持 Body 传参而非 Query）
2. 给 SSE 响应添加 `event` 字段，实现多种事件类型（如 `message`、`done`、`error`）
3. 实现心跳机制：空闲时每 15 秒发送 `:keep-alive` 注释行，防止连接超时
4. 添加连接数限制：当同时连接数超过阈值时拒绝新连接

**LangChain 集成**

5. 在 `ai.service.ts` 中添加带对话历史的 Chain（结合 `RunnableWithMessageHistory`）
6. 实现多模型切换：通过 Query 参数选择不同模型（如 qwen-max / qwen-plus）
7. 添加 Tool Calls 支持：让 SSE 端点也能流式输出工具调用结果
8. 实现 Chain 的降级机制：主模型失败时自动切换到备选模型

**前端交互**

9. 在 `index.html` 中添加 Markdown 渲染（使用 marked.js）
10. 实现多轮对话界面：维护消息历史，支持连续提问
11. 添加流式输出的进度显示（已接收字符数、耗时统计）
12. 实现断线重连机制：SSE 连接意外断开时自动重试

**工程化**

13. 添加 Swagger 文档：为 SSE 端点生成 API 文档
14. 实现请求日志中间件：记录每次 SSE 请求的查询内容和响应耗时
15. 添加限流守卫（ThrottlerGuard）：防止 SSE 端点被滥用
16. 实现流式输出的单元测试：使用 Observable 测试工具验证 SSE 输出

### Nest + Tool Calling AI 智能助手练习

**ReAct 循环**

1. 添加最大循环轮次限制（maxIterations），防止 AI 陷入无限工具调用死循环
2. 实现并行工具调用：用 Promise.all 同时执行多个不依赖的工具
3. 添加工具调用日志记录，显示每轮 AI 调用了什么工具、传了什么参数、结果如何
4. 实现缓存机制：同一工具相同参数的结果在短时间内不再重复调用

**工具扩展**

5. 添加 `weather_search` 工具：通过天气 API 查询指定城市的天气信息
6. 添加 `calculator` 工具：让 AI 能够调用计算器处理数学运算
7. 添加 `get_time` 工具：返回当前时间，测试无参数的简单工具
8. 实现动态工具发现：将 if/else 调度改为注册表模式，新增工具无需改调度代码

**流式输出**

9. 优化流式输出中工具调用的用户体验：调用工具时显示「🔍 正在查询用户信息...」
10. 将工具返回结果也以流式方式推送，用户能看到 AI 的"思考过程"
11. 实现带权重的工具选择：AI 在多个工具之间时显示候选列表

**邮件集成**

12. 补充安装 `@nestjs-modules/mailer` 并配置 SMTP，测试发送邮件功能
13. 添加邮件发送模板：支持 HTML 格式的邮件排版
14. 实现邮件发送队列：批量发送时不阻塞 AI 响应

**工程化**

15. 给工具添加超时机制：调用外部 API（如 Bocha）超过 5 秒自动超时
16. 实现工具的健康检查端点：`GET /ai/tools/status` 返回所有工具的可用状态
17. 添加 AI 的多轮对话记忆：用 RunnableWithMessageHistory 支持上下文对话

### 结构化大模型输出练习

**基础解析**

1. 对比 `normal.mjs` 和 `json-output-parser.mjs`，观察 AI 返回格式的稳定性差异
2. 故意让 AI 返回包含额外文字的 JSON，测试两种解析方式的容错能力
3. 修改 `json-output-parser.mjs` 的 schema，添加更多字段观察效果

**结构化定义**

4. 在 `zod-schema-parser.mjs` 中定义一个新的复杂 schema（如电影信息、商品信息）
5. 实现嵌套对象数组（如作者的多本书籍，每本书有多个章节）
6. 测试 ZodError 错误处理，观察 AI 返回不符合 schema 时的详细错误信息
7. 对比 `structured-output-parser.mjs` 和 `zod-schema-parser.mjs` 的格式指令差异

**流式输出**

8. 修改 `stream-normal.mjs`，添加进度条显示（如：已接收 X 字符）
9. 在 `stream-structured-partial.mjs` 中实现实时解析进度显示
10. 优化 `stream-tool-calls-parser.mjs` 的 diff 算法，支持格式化 JSON 显示
11. 实现流式输出的暂停/继续功能（模拟网络中断场景）

**Tool Calls**

12. 在 `stream-tool-calls-raw.mjs` 中添加多工具调用支持
13. 实现 Tool Calls 结果的自动执行（如调用天气 API、搜索 API）
14. 对比 `bindTools` 和 `withStructuredOutput` 的底层实现差异
15. 实现 Tool Calls 的并行调用和结果聚合

**XML 格式**

16. 修改 `xml-output-parser.mjs`，定义特定的 XML schema（如果支持）
17. 对比 XML 和 JSON 在同一任务中的 AI 遵循度
18. 实现 XML 结果的 XPath 查询和数据提取

## MCP 配置踩坑记录

这部分是这次学习里非常容易踩到的几个真实问题。

### 1. filesystem MCP 的路径参数不能拼成一个字符串

错误写法思路：

```js
process.env.ALLOWED_PATHS.split(',').join(' ')
```

这会把多个目录拼成一个参数字符串，结果 `server-filesystem` 接收到的不是多个独立路径。

正确思路是把它展开成多个参数：

```js
const allowedPaths = process.env.ALLOWED_PATHS.split(',')
  .map(v => v.trim())
  .filter(Boolean)
args: ['-y', '@modelcontextprotocol/server-filesystem', ...allowedPaths]
```

如果写在 `mcp.json` 里，就直接把多个路径静态展开写进去。

### 2. filesystem 必须放在 `mcpServers` 里

`MultiServerMCPClient` 只会读取 `mcpServers` 下声明的服务。如果把 `filesystem` 写到 `mcpServers` 外层，客户端不会加载它。

### 3. `chrome-devtools-mcp` 对 Node 版本有要求

这次实际遇到的问题是：

- 当前 Node：`v20.11.1`
- `chrome-devtools-mcp@0.21.0` 要求：`^20.19.0 || ^22.12.0 || >=23`

如果 MCP Client 启动它时报 `EBADENGINE` 或 `Client closed`，优先检查 Node 版本。

对 GUI 客户端，最稳的方式不是依赖 `nvm use`，而是在配置里直接写新版 `npx` 的绝对路径，例如：

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "/Users/chenkun/.nvm/versions/node/v22.22.1/bin/npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

## 可以继续扩展的方向

**通用扩展**

- 给根项目补充 `npm scripts`，减少手动输入命令
- 为工具增加更严格的参数校验和错误处理
- 增加文件搜索、HTTP 请求、Git 操作等更多工具
- 把 Agent 示例改造成命令行可输入任意任务
- 把 MCP Server 里的内存数据换成真实数据库或外部接口
- 增加日志记录，方便观察每轮模型决策和工具调用

**对话记忆管理扩展**

- 为对话记忆管理增加数据库后端（如 Redis、MongoDB）
- 实现更智能的记忆压缩策略（关键信息提取、实体保留）
- 增加记忆管理的可视化调试工具
- 实现记忆的自动过期清理机制（TTL）
- 支持多用户会话隔离与权限控制
- 增加检索结果的反馈学习（记录哪些检索结果被有效使用）

**Milvus 向量数据库扩展**

- 实现向量数据库的性能监控（查询延迟、内存占用）
- 支持增量更新：只向量化新增内容，避免全量重建
- 实现向量数据的备份与恢复机制
- 探索分布式 Milvus 集群部署方案
- 对比 Milvus 与其他向量数据库（Pinecone、Weaviate、Chroma）

**电子书 RAG 系统扩展**

- 支持更多文档格式（PDF、Markdown、TXT、DOCX）
- 实现智能目录解析（自动识别章节结构、标题层级）
- 增加多语言支持（中英文混合书籍、翻译功能）
- 实现书籍内容摘要生成（自动为每本书生成简介）
- 构建多书籍知识图谱（角色关系、事件时间线）
- 增加引用溯源功能（回答时精确到段落和页码）

## 注意事项

- 这是一个学习仓库，重点是帮助理解思路，不是生产环境最佳实践
- `command-execute` 直接执行 shell 命令，真实场景需要更严格的权限和安全限制
- 当前根项目没有自动化测试
- 如果你准备继续扩展，建议优先补上脚本、日志和错误处理
- 运行检索策略示例前，需要先启动 Milvus 服务（参考 Docker Compose 配置）
- Milvus 向量数据库占用内存较大，建议至少分配 4GB 以上内存
- 运行智能录入与 Mini Cursor Agent 示例前，需要先启动 MySQL 服务
- 数据库密码不要硬编码在代码中，务必使用 `.env` 文件管理
- `mini-cursor.mjs` 会实际执行命令和写入文件，建议在测试目录中运行
- 运行 Nest + LangChain 流式 AI 接口示例前，需要先在根目录 `.env` 中配置 `MODEL`、`API_KEY`、`BASE_URL`
- `asr-and-tts-nest-service` 项目需要单独安装依赖（`cd src/asr-and-tts-nest-service && pnpm install`）
- SSE 连接长时间空闲可能被代理服务器断开，生产环境需要添加心跳机制
- `cron-job-tool` 项目需要单独安装依赖（`cd src/cron-job-tool && pnpm install`）
- 运行 `cron-job-tool` 互联网搜索功能需要在 `.env` 中配置 `BOCHA_API_KEY`
- 运行 `cron-job-tool` 邮件发送功能需要安装 `@nestjs-modules/mailer` 并配置 SMTP 环境变量
- `cron-job-tool` 的 `runChain()` 和 `runChainStream()` 目前没有最大循环限制，生产环境应添加 `maxIterations`
- MySQL Docker 容器会占用约 500MB 磁盘空间，用完后可以用 `docker-compose down -v` 清理
