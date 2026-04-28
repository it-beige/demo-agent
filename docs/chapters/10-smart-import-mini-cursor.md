# 第 10 章：智能录入与 Mini Cursor Agent

> 两个完整的 AI 应用实战案例：智能数据录入 + 简化版 AI 编程助手。核心问题：**如何将 AI 输出解析技术应用到真实业务场景中。**

---

## 📖 章节简介

- **文件**：`src/output-parse-demo/` 目录下的实战示例
- **内容**：两个完整的 AI 应用实战案例
  - **智能数据录入**：AI 驱动的非结构化文本提取 + MySQL 批量插入
    - Zod Schema 定义数据结构、`withStructuredOutput` 自动解析
    - 批量插入语法、事务处理、环境变量配置
  - **Mini Cursor Agent**：简化版 AI 编程助手实现
    - ReAct 模式（推理 → 行动 → 观察循环）
    - 流式工具调用处理、增量 diff 显示算法
    - 消息历史管理、多轮自主任务执行
  - **工程化配置**：数据库常量提取、Docker Compose 服务编排
- **重点**：从理论到实战的完整链路、Agent 自主决策机制、流式处理优化
- **核心问题**：如何将 AI 输出解析技术应用到真实业务场景中

---

## 📁 涉及文件

### 智能数据录入（2 个文件）

- `src/output-parse-demo/smart-import.mjs`：AI 驱动的非结构化文本提取 + MySQL 批量插入
- `src/output-parse-demo/create-table.mjs`：数据库初始化脚本（建表 + 插入测试数据）

### Mini Cursor Agent（1 个文件）

- `src/output-parse-demo/mini-cursor.mjs`：简化版 AI 编程助手（ReAct 模式 + 流式工具调用）

### 工程化配置（2 个文件）

- `src/output-parse-demo/constant.mjs`：数据库配置常量提取（连接配置、表结构、SQL 语句）
- `src/output-parse-demo/docker-compose-mysql.yml`：MySQL Docker 服务编排配置

---

## 🚀 如何运行

### 0️⃣ 前置准备：启动 MySQL 服务

```bash
# 使用 Docker Compose 启动 MySQL
docker-compose -f src/output-parse-demo/docker-compose-mysql.yml up -d

# 查看服务状态
docker-compose -f src/output-parse-demo/docker-compose-mysql.yml ps
```

> ⚠️ 还需要在 `src/output-parse-demo/.env` 中配置数据库环境变量，详见 [快速开始 - 数据库](./../getting-started.md#数据库可选)。

---

### 1️⃣ 初始化数据库（建表 + 插入测试数据）

```bash
node src/output-parse-demo/create-table.mjs
```

这个示例会：

- 连接到 MySQL 数据库（使用 `.env` 中的配置）
- 创建 `friends` 表（包含姓名、性别、出生日期、公司、职位、手机、微信等字段）
- 批量插入 2 条测试数据（王经理、李总监）
- 使用事务保证数据一致性

---

### 2️⃣ 测试智能数据录入（AI 文本提取 + 数据库插入）

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

---

### 3️⃣ 测试 Mini Cursor Agent（AI 自主完成任务）

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

> ⚠️ `mini-cursor.mjs` 会**实际执行命令和写入文件**，建议在测试目录中运行。详见 [踩坑记录 - 注意事项](./../troubleshooting.md#智能录入与-mini-cursor-agent)。

---

## 🗺️ 推荐学习顺序

详见 [推荐学习顺序 - 智能录入与 Mini Cursor Agent 学习路径](./../learning-path.md#-智能录入与-mini-cursor-agent-学习路径)。

---

## ✏️ 动手练习

详见 [建议动手练习 - 智能录入与 Mini Cursor Agent 练习](./../exercises.md#-智能录入与-mini-cursor-agent-练习)。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 9 章 结构化大模型输出](./09-structured-output.md) | [章节目录](./../../README.md#-章节目录) | [第 11 章 PromptTemplate 组件化管理](./11-prompt-template.md) |
