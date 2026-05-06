# [PromptTemplate] 提示词组件化：Pipeline、Few-Shot、动态示例选择

> 从单文件模板到 Pipeline 组合、Few-Shot 示例注入、向量检索动态选示例的完整演进。
> **关键词**：PipelinePromptTemplate、FewShot、Partial、ChatPromptTemplate、Milvus

## 核心设计

当 prompt 变得越来越复杂（人设、背景、任务说明、输出格式、Few-Shot 示例...），单文件硬编码很快失控。这个 demo 的解决思路：

- **PipelinePromptTemplate**：将 prompt 按职责拆为独立模块（如 `persona`、`context`、`task`、`format`），Pipeline 自动组装分发。模块可跨场景复用
- **`.partial()`**：预填充不变的变量（公司信息、价值观），创建模板工厂函数，运行时只填变化的变量
- **`ChatPromptTemplate`**：支持 system/human/assistant 多角色消息格式，标准化的对话模板
- **`FewShotPromptTemplate`**：通过示例指导模型学习语气、结构和输出要求，支持字符串和对话两种格式
- **动态示例选择**：基于 Milvus 向量检索，根据用户问题语义相似度自动选择最相关的 Few-Shot 示例

## 运行方式

```bash
# 基础和管道
pnpm dev src/prompt-template/prompt-template1.mjs
pnpm dev src/prompt-template/pipeline-prompt-template.mjs
pnpm dev src/prompt-template/pipeline-prompt-template3.mjs

# 部分应用 & 对话
pnpm dev src/prompt-template/partial.mjs
pnpm dev src/prompt-template/chat-prompt-template.mjs

# Few-Shot
pnpm dev src/prompt-template/fewshot-prompt-template.mjs
pnpm dev src/prompt-template/fewshot-chat-prompt-template.mjs

# 向量检索（需先启动 Milvus）
pnpm dev src/prompt-template/weekly-report-examples-writer-milvus.mjs
pnpm dev src/prompt-template/weekly-report-examples-reader-milvus.mjs
```

## 扩展方向

- 将 Pipeline 模块提取为 JSON 配置文件，运行时动态加载
- 给动态示例选择增加相似度阈值过滤，低分示例不注入
- 对比静态 Few-Shot 和动态检索 Few-Shot 的生成质量差异

---
⬅️ [智能录入 + Mini Cursor](./10-smart-import-mini-cursor.md) ｜ [📚 目录](../../README.md#目录) ｜ [声明式 Chain ➡️](./12-runnable-chain.md)