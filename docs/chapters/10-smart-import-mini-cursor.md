# [Agent·实战] 智能数据录入 + Mini Cursor Agent

> 两个完整实战案例：AI 驱动的非结构化文本→MySQL 批量录入，以及一个简化版 AI 编程助手（ReAct + 流式工具调用）。
> **关键词**：结构化提取、MySQL、ReAct、Mini Cursor、流式工具调用

## 核心设计

### 智能数据录入

把自然语言描述的人物信息（"张总，女的，30 出头，在腾讯做技术总监，手机 138..."）自动提取为结构化数据并入库。核心链路：Zod Schema 定义目标结构 → `withStructuredOutput` 让模型提取 → 批量 INSERT 入 MySQL，全程走事务保证一致性。

### Mini Cursor Agent

一个最小可用的 AI 编程助手。内置 4 个工具（`command-execute`、`file-write`、`file-read`、`directory-list`），通过 ReAct 循环让模型在 30 轮内自主完成任务。流式显示文件写入过程（增量 diff 算法），能看到模型逐行生成代码。

工程化方面：数据库配置提取到 `constant.mjs`，MySQL 用 Docker Compose 一键启动。

## 运行方式

```bash
# 启动 MySQL
docker-compose -f src/output-parse-demo/docker-compose-mysql.yml up -d

# 初始化数据库
pnpm dev src/output-parse-demo/create-table.mjs

# 智能录入
pnpm dev src/output-parse-demo/smart-import.mjs

# Mini Cursor Agent（会实际执行命令和写文件）
pnpm dev src/output-parse-demo/mini-cursor.mjs
```

> ⚠️ Mini Cursor Agent 会实际执行命令，建议在测试目录中运行。

## 扩展方向

- 给 Mini Cursor Agent 增加更多工具（文件搜索、HTTP 请求、Git 操作）
- 智能录入加入数据验证和错误重试机制
- 将 Agent 循环改造成 LangGraph StateGraph 实现

---
⬅️ [结构化输出](./09-structured-output.md) ｜ [📚 目录](../../README.md#目录) ｜ [提示词组件化 ➡️](./11-prompt-template.md)