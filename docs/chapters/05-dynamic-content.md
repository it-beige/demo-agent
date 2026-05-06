# [RAG·Pipeline] Puppeteer 动态页面抓取

> 使用 Puppeteer 抓取 JavaScript 动态渲染的页面（如掘金文章），解决静态 HTML 解析器拿不到内容的问题。
> **关键词**：Puppeteer、动态渲染、SPA 抓取、Document 转换

## 核心设计

很多现代网站（SPA、掘金等）的内容由 JavaScript 动态生成，`fetch` + Cheerio 只能拿到空壳 HTML。这个 demo 用 Puppeteer 启动无头浏览器，等待页面 JS 执行完毕后再提取完整 DOM，然后转换为 LangChain Document 对象供后续切分和索引使用。

与第 4 章和第 6 章的 Cheerio 方案互补：静态页面优先用 Cheerio（轻量、快），动态页面才上 Puppeteer（重但完整）。

## 扩展方向

- 添加页面滚动模拟，抓取无限加载的列表页
- 实现等待特定元素出现后再提取（`waitForSelector`），避免拿不到内容

---
⬅️ [RAG 检索增强](./04-rag.md) ｜ [📚 目录](../../README.md#目录) ｜ [渐进式降级 ➡️](./06-compatibility-loader.md)