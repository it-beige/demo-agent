# [RAG·Pipeline] 文本分割器：多策略切分与调优

> 对比 LangChain 提供的多种文本分割器，理解不同分割策略对 RAG 检索质量的影响。
> **关键词**：RecursiveCharacterTextSplitter、TokenTextSplitter、fromLanguage、chunk 调优

## 核心设计

文本切分是 RAG 管线中最容易被低估的环节——切太碎丢失上下文，切太长检索不准。`src/splitters/` 下用 5 个脚本对比了这几类切分策略：

- **RecursiveCharacterTextSplitter**：按分隔符优先级递归切分（默认 `\n\n` → `\n` → ` ` → 单字符），大部分场景的默认选择；demo 里把分隔符换成了更贴合日志与中文的 `['\n', '。', '，']`
- **TokenTextSplitter**：直接按 token 计数切分，精确控制上下文窗口预算
- **代码专用切分**：`RecursiveCharacterTextSplitter.fromLanguage('js')` 会换上按语法结构排序的分隔符（`\nclass `、`\nfunction `、`\nconst ` 等），避免把函数体切断
- **Markdown / LaTeX 专用分割器**：`MarkdownTextSplitter`、`LatexTextSplitter` 是独立的类，不走 `fromLanguage()`，分别按标题层级、`\section{}`/`\begin{}` 等结构边界切分

核心调优参数：`chunkSize` 控制每块大小，`chunkOverlap` 控制相邻块的重叠量——重叠保证关键信息不会恰好落在 chunk 边界上被切断。

还要注意 `chunkSize` 的单位取决于长度函数：默认按字符数计，而 `RecursiveCharacterTextSplitter.mjs` 传入了 `lengthFunction: text => enc.encode(text).length`（js-tiktoken，`cl100k_base`），单位就变成了 token——那里的 150 是 150 个 token，不是 150 个字符。

| 脚本                                 | 分割器                                              | chunkSize / chunkOverlap | 长度单位          |
| ------------------------------------ | --------------------------------------------------- | ------------------------ | ----------------- |
| `RecursiveCharacterTextSplitter.mjs` | RecursiveCharacterTextSplitter + 自定义分隔符       | 150 / 20                 | token（tiktoken） |
| `TokenTextSplitter.mjs`              | TokenTextSplitter（`encodingName: 'cl100k_base'`）  | 50 / 10                  | token             |
| `RecursiveSplitterCode.mjs`          | `RecursiveCharacterTextSplitter.fromLanguage('js')` | 300 / 60                 | 字符              |
| `RecursiveSplitterMarkdown.mjs`      | MarkdownTextSplitter                                | 400 / 80                 | 字符              |
| `RecursiveSplitterLatex.mjs`         | LatexTextSplitter                                   | 200 / 40                 | 字符              |

## 运行方式

```bash
pnpm dev src/splitters/RecursiveCharacterTextSplitter.mjs
pnpm dev src/splitters/TokenTextSplitter.mjs
pnpm dev src/splitters/RecursiveSplitterCode.mjs
pnpm dev src/splitters/RecursiveSplitterMarkdown.mjs
pnpm dev src/splitters/RecursiveSplitterLatex.mjs
```

每个脚本都会打印切分后的 Document 和每块的字符数，两个 token 相关的脚本还会额外打印 token 数，便于对比不同策略的切分边界。

## 扩展方向

- 调整 `chunkSize`/`chunkOverlap`，观察对检索召回率和回答完整性的影响
- 结合实际 RAG 管线，对比不同分割器下的检索质量差异
- 补一个 `CharacterTextSplitter`（按单一分隔符切分）的对照 demo，看它和递归切分的差别

---

⬅️ [渐进式降级](./06-compatibility-loader.md) ｜ [📚 目录](../../README.md#目录) ｜ [Milvus 向量数据库 ➡️](./08-milvus-vector-db.md)
