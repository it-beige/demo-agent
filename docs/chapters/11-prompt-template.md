# 第 11 章：PromptTemplate 组件化管理

> 从基础模板到组件化的完整演进路径。核心问题：**如何管理复杂提示词，让它可维护、可复用、可测试。**

---

## 📖 章节简介

- **文件**：`src/prompt-template/` 目录下的示例代码
- **内容**：从基础模板到组件化的完整演进路径
  - **基础模板**：`PromptTemplate` 基础用法、占位符替换
  - **管道模板**：`PipelinePromptTemplate` 模块化组合、子模板复用
  - **部分应用**：`.partial()` 预填充变量、模板工厂模式
  - **对话模板**：`ChatPromptTemplate` 多角色消息、system/human/assistant
  - **少样本模板**：`FewShotPromptTemplate` 示例指导、`FewShotChatMessagePromptTemplate` 对话示例
  - **向量检索**：Milvus 存储示例、动态检索最相关示例
- **重点**：模板组件化、模块复用、动态示例选择、对话格式标准化
- **核心问题**：如何管理复杂提示词，让它可维护、可复用、可测试

---

## 📁 涉及文件

### 基础模板（1 个文件）

- `src/prompt-template/prompt-template1.mjs`：`PromptTemplate` 基础用法、占位符替换

### 管道模板（3 个文件）

- `src/prompt-template/pipeline-prompt-template.mjs`：`PipelinePromptTemplate` 模块化组合（人设/背景/任务/格式）
- `src/prompt-template/pipeline-prompt-template2.mjs`：OKR 评审场景、模块复用演示
- `src/prompt-template/pipeline-prompt-template3.mjs`：Pipeline + `ChatPromptTemplate` 组合

### 部分应用（1 个文件）

- `src/prompt-template/partial.mjs`：`.partial()` 预填充变量、模板工厂模式

### 对话模板（2 个文件）

- `src/prompt-template/chat-prompt-template.mjs`：`ChatPromptTemplate` 基础用法、system/human 角色
- `src/prompt-template/chat-prompt-template2.mjs`：多轮对话示例

### 少样本模板（4 个文件）

- `src/prompt-template/fewshot-prompt-template.mjs`：`FewShotPromptTemplate` 基础用法（字符串格式）
- `src/prompt-template/fewshot-chat-prompt-template.mjs`：`FewShotChatMessagePromptTemplate`（对话格式）
- `src/prompt-template/example-selector1.mjs`：动态选择示例（基础）
- `src/prompt-template/example-selector2.mjs`：基于相似度选择示例（Milvus 检索）

### 向量数据库（2 个文件）

- `src/prompt-template/weekly-report-examples-writer-milvus.mjs`：将周报示例写入 Milvus
- `src/prompt-template/weekly-report-examples-reader-milvus.mjs`：从 Milvus 检索示例

---

## 🚀 如何运行

### 基础模板

```bash
node src/prompt-template/prompt-template1.mjs
```

这个示例会：

- 演示 `PromptTemplate` 基础用法
- 使用占位符 `{variable}` 定义模板
- 调用 `.format()` 填入变量生成提示词

---

### 管道模板

```bash
node src/prompt-template/pipeline-prompt-template.mjs
```

这个示例会：

- 使用 `PipelinePromptTemplate` 组合 4 个模块（人设/背景/任务/格式）
- 演示模块导出与复用（`personaPrompt`、`contextPrompt`）
- 一次传入所有变量，Pipeline 自动分发到子模板

```bash
node src/prompt-template/pipeline-prompt-template3.mjs
```

这个示例会：

- 将 `PipelinePromptTemplate` 与 `ChatPromptTemplate` 组合
- `finalPrompt` 使用对话格式（system + human）
- 使用 `.formatPromptValue()` 生成消息数组

---

### 部分应用

```bash
node src/prompt-template/partial.mjs
```

这个示例会：

- 使用 `.partial()` 预填充不变的变量（公司信息、价值观）
- 基于预配置模板多次调用 `.format()` 填入变化的变量
- 演示模板工厂模式

---

### 对话模板

```bash
node src/prompt-template/chat-prompt-template.mjs
```

这个示例会：

- 使用 `ChatPromptTemplate` 定义多角色对话
- system 消息设定角色，human 消息提供数据
- 调用 `.formatMessages()` 生成消息数组
- 直接传给 `model.invoke()` 调用模型

---

### 少样本模板

```bash
node src/prompt-template/fewshot-prompt-template.mjs
```

这个示例会：

- 使用 `FewShotPromptTemplate` 提供示例指导
- 定义示例模板（`examplePrompt`）和示例数据（`examples`）
- 通过示例让 AI 学习语气、结构和信息组织方式

```bash
node src/prompt-template/fewshot-chat-prompt-template.mjs
```

这个示例会：

- 使用 `FewShotChatMessagePromptTemplate` 在对话中插入示例
- 每条示例展开为 `HumanMessage` + `AIMessage`
- 流式调用模型并实时输出

---

### 向量数据库操作

> ⚠️ **前置条件**：需要先启动 Milvus 服务

#### 1. 写入示例到 Milvus

```bash
node src/prompt-template/weekly-report-examples-writer-milvus.mjs
```

这个示例会：

- 定义 8 个不同场景的周报示例
- 使用 Embedding 模型将文本转换为 1024 维向量
- 在 Milvus 中创建集合和索引
- 批量插入示例数据（包含向量）

#### 2. 从 Milvus 检索示例

```bash
node src/prompt-template/weekly-report-examples-reader-milvus.mjs
```

这个示例会：

- 根据用户输入生成查询向量
- 在 Milvus 中检索最相似的示例
- 演示语义检索的应用

---

## 🗺️ 推荐学习顺序

详见 [推荐学习顺序 - PromptTemplate 组件化管理学习路径](./../learning-path.md#-prompttemplate-组件化管理学习路径)。

---

## ✏️ 动手练习

详见 [建议动手练习 - PromptTemplate 组件化管理练习](./../exercises.md#-prompttemplate-组件化管理练习)。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 10 章 智能录入与 Mini Cursor Agent](./10-smart-import-mini-cursor.md) | [章节目录](./../../README.md#-章节目录) | [第 12 章 Runnable - 把写逻辑变成组装 Chain](./12-runnable-chain.md) |
