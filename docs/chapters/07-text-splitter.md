# [RAG·Pipeline] 文本分割器：多策略切分与调优

> 对比 LangChain 提供的多种文本分割器，理解不同分割策略对 RAG 检索质量的影响。
> **关键词**：RecursiveCharacterTextSplitter、TokenTextSplitter、chunk 调优

## 核心设计

文本切分是 RAG 管线中最容易被低估的环节——切太碎丢失上下文，切太长检索不准。这个 demo 对比了 6 种分割器：

- **CharacterTextSplitter**：按单个字符切分，简单但容易切断语义单元
- **RecursiveCharacterTextSplitter**：按分隔符优先级递归切分（`\n\n` → `\n` → ` ` → 字符），大部分场景的默认选择
- **TokenTextSplitter**：按 token 计数切分，精确控制上下文窗口预算
- **代码/Markdown/LaTeX 专用分割器**：通过 `fromLanguage()` 适配特定语法的分隔符，避免切断函数体、表格、公式

核心调优参数：`chunkSize` 控制每块大小，`chunkOverlap` 控制相邻块的重叠量——重叠保证关键信息不会恰好落在 chunk 边界上被切断。

## 运行方式

```bash
pnpm dev src/splitters/CharacterTextSplitter-test.mjs
pnpm dev src/splitters/RecursiveCharacterTextSplitter-test.mjs
pnpm dev src/splitters/TokenTextSplitter-test.mjs
pnpm dev src/splitters/recursive-splitter-code.mjs
pnpm dev src/splitters/recursive-splitter-markdown.mjs
pnpm dev src/splitters/recursive-splitter-latex.mjs
```

每个脚本会打印切分结果，对比不同策略的分割效果。

## 扩展方向

- 调整 `chunkSize`/`chunkOverlap`，观察对检索召回率和回答完整性的影响
- 结合实际 RAG 管线，对比不同分割器下的检索质量差异

---
⬅️ [渐进式降级](./06-compatibility-loader.md) ｜ [📚 目录](../../README.md#目录) ｜ [对话记忆管理 ➡️](./08-conversation-memory.md)