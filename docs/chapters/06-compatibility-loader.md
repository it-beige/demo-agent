# [RAG·Pipeline] 渐进式加载降级：Cheerio → Puppeteer

> Cheerio + Puppeteer 两级降级策略：静态解析优先，失败时自动回退到浏览器渲染。
> **关键词**：Cheerio、Puppeteer、降级策略、渐进式加载

## 核心设计

不是所有网页都需要启动浏览器。这个 demo 的核心决策是"先用轻量的试试，不行再上重的"：

1. 尝试用 Cheerio 解析 HTML（毫秒级，零资源开销）
2. 如果拿不到有效内容（SPA 页面），自动切换到 Puppeteer 无头浏览器渲染

这套降级策略在生产环境中很实用——大部分文档站、博客、新闻页面用 Cheerio 就够了，只有少数重度 SPA 才需要 Puppeteer，整体性能和稳定性都更好。

该 demo 与第 4 章 RAG 共享入口文件 `loader-and-spliter2.mjs`，降级逻辑在 loader 选择阶段完成。

## 扩展方向

- 增加第三级降级：缓存上次成功加载的 HTML
- 给 Puppeteer 增加页面加载超时，避免卡死

---
⬅️ [Puppeteer 动态抓取](./05-dynamic-content.md) ｜ [📚 目录](../../README.md#目录) ｜ [文本分割器 ➡️](./07-text-splitter.md)