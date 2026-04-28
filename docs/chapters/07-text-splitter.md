# 第 7 章：文本分割器详解

> 系统学习 LangChain 提供的多种文本分割器，理解不同分割策略的适用场景与调优方式。

---

## 📖 章节简介

- **文件**：`src/splitters/` 目录下的示例代码
- **内容**：`CharacterTextSplitter`、`RecursiveCharacterTextSplitter`、`TokenTextSplitter` 以及面向特定格式的代码/Markdown/LaTeX 分割器
- **重点**：不同分割策略的适用场景、`chunkSize`/`chunkOverlap` 调优、Token 计数控制
- **补充**：语言特定的分割器配置（`fromLanguage`）

---

## 📁 涉及文件

### 文本分割器示例

| 文件                                                | 作用                                  |
| --------------------------------------------------- | ------------------------------------- |
| `src/splitters/CharacterTextSplitter-test.mjs`      | 基于字符的分割器示例                  |
| `src/splitters/RecursiveCharacterTextSplitter-test.mjs` | 递归字符分割器（支持自定义分隔符）   |
| `src/splitters/TokenTextSplitter-test.mjs`          | 基于 Token 计数的分割器               |
| `src/splitters/recursive-splitter-code.mjs`         | 代码专用分割器（支持 JS 等语言）      |
| `src/splitters/recursive-splitter-markdown.mjs`     | Markdown 文档专用分割器               |
| `src/splitters/recursive-splitter-latex.mjs`        | LaTeX 数学公式专用分割器              |

---

## 🚀 如何运行

> 💡 源 README 未为本章单独提供运行说明。各示例文件可直接通过 `node` 运行：
>
> ```bash
> node src/splitters/CharacterTextSplitter-test.mjs
> node src/splitters/RecursiveCharacterTextSplitter-test.mjs
> node src/splitters/TokenTextSplitter-test.mjs
> node src/splitters/recursive-splitter-code.mjs
> node src/splitters/recursive-splitter-markdown.mjs
> node src/splitters/recursive-splitter-latex.mjs
> ```

---

## ✏️ 动手练习

> 💡 源 README 未为本章单独列出动手练习。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 6 章 兼容性加载方案](./06-compatibility-loader.md) | [章节目录](./../../README.md#-章节目录) | [第 8 章 对话记忆管理](./08-conversation-memory.md) |
