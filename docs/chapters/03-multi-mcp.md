# 第 3 章：多 MCP Server 集成

> 通过 `MultiServerMCPClient` 同时挂载多个 MCP Server（高德地图 MCP + filesystem MCP）。

---

## 📖 章节简介

- **文件**：`src/demo/mcp-amap.mjs`
- **内容**：`MultiServerMCPClient`、高德地图 MCP、filesystem MCP
- **流程图**：`src/demo/mco-amap-flow.md`

---

## 📁 涉及文件

### MCP Client 示例

- `src/demo/mcp-amap.mjs`：`MultiServerMCPClient` 集成高德地图和 filesystem

### 流程图

- `src/mco-amap-flow.md`：MCP Agent 调用流程图和时序图

---

## 🚀 如何运行

### 前置条件

需要在 `.env` 中配置：

```bash
AMAP_MAPS_API_KEY=your-amap-key
ALLOWED_PATHS=/absolute/path/one,/absolute/path/two
```

详见 [快速开始 - 高德地图 + filesystem MCP](./../getting-started.md#高德地图-filesystem-mcp可选)。

### 示例命令

执行：

```bash
node src/mcp-amap.mjs "请列出 /Users/chenkun/Desktop 下的前几个文件，如果工具结果不足以支持结论，请明确说明不确定。"
```

或者：

```bash
node src/mcp-amap.mjs "查一下北京南站三公里附近的酒店，如果工具结果不足以支持结论，请明确说明不确定。"
```

### 观察重点

这个示例适合重点观察：

- 模型会不会先选对工具
- filesystem 工具是否只能访问 `ALLOWED_PATHS` 里声明过的目录
- 当工具结果不足时，模型是否会明确说"不确定"

---

## ⚠️ 易踩的坑

| 坑点                                  | 详细说明                                                         |
| ------------------------------------- | ---------------------------------------------------------------- |
| filesystem MCP 路径参数不能拼成字符串 | [详见踩坑记录 #1](./../troubleshooting.md#1-filesystem-mcp-的路径参数不能拼成一个字符串) |
| filesystem 必须放在 `mcpServers` 里   | [详见踩坑记录 #2](./../troubleshooting.md#2-filesystem-必须放在-mcpservers-里) |
| `chrome-devtools-mcp` 对 Node 版本有要求 | [详见踩坑记录 #3](./../troubleshooting.md#3-chrome-devtools-mcp-对-node-版本有要求) |

---

## ✏️ 动手练习

更多 MCP 相关练习参见 [练习 - MCP 相关练习](./../exercises.md#-mcp-相关练习)。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 2 章 MCP Server 基础](./02-mcp-server-basic.md) | [章节目录](./../../README.md#-章节目录) | [第 4 章 RAG 检索增强生成](./04-rag.md) |
