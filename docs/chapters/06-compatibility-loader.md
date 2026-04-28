# 第 6 章：兼容性加载方案

> Cheerio + Puppeteer 渐进式降级策略，在性能与稳定性之间取得平衡。

---

## 📖 章节简介

- **文件**：`src/demo/loader-and-spliter2.mjs`
- **内容**：Cheerio + Puppeteer 渐进式降级策略
- **重点**：性能与稳定性的平衡设计

---

## 📁 涉及文件

- `src/demo/loader-and-spliter2.mjs`：网页加载 + 文本切分 + RAG 完整流程（也是 [第 4 章](./04-rag.md) 用到的文件）

---

## 🚀 如何运行

> 💡 本章与 [第 4 章 RAG 检索增强生成](./04-rag.md) 共享同一个入口文件 `src/loader-and-spliter2.mjs`，运行方式相同。本章重点关注**加载器降级策略**部分：先用 Cheerio 轻量加载，失败时再回退到 Puppeteer。

---

## ✏️ 动手练习

> 💡 源 README 未为本章单独列出动手练习。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 5 章 动态网站内容提取](./05-dynamic-content.md) | [章节目录](./../../README.md#-章节目录) | [第 7 章 文本分割器详解](./07-text-splitter.md) |
