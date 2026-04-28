# 第 15 章：Nest + Tool 实现 OpenClaw 同款定时任务

> 基于 NestJS + TypeORM + `SchedulerRegistry` 实现 AI 驱动的定时任务系统。核心问题：**如何实现类似 OpenClaw 的 AI 定时任务——用户用自然语言描述任务，系统自动调度并执行。**

---

## 📖 章节简介

- **文件**：`src/cron-job-tool/` 目录下的 Job 模块（`src/job/`）
- **内容**：基于 NestJS + TypeORM + `SchedulerRegistry` 实现 AI 驱动的定时任务系统
  - **任务实体**：Job Entity 支持三种调度类型（cron 表达式、interval 间隔、at 一次性）
  - **任务管理**：CRUD 操作 + 动态启停 + 运行状态追踪 + 执行时间记录
  - **任务执行**：`JobAgentService` 绑定多工具（搜索/邮件/数据库），用 AI 理解自然语言指令并自动调用工具完成
  - **启动恢复**：`OnApplicationBootstrap` 钩子自动加载已启用任务并恢复调度器状态
  - **持久化存储**：TypeORM + SQLite/MySQL 存储任务定义和执行历史
- **重点**：`SchedulerRegistry` 统一管理定时任务、AI Agent 作为任务执行器、自然语言指令解析、任务生命周期管理
- **核心问题**：如何实现类似 OpenClaw 的 AI 定时任务——用户用自然语言描述任务，系统自动调度并执行

---

## 📁 涉及文件

### 核心文件（4 个文件）

- `src/cron-job-tool/src/job/entities/job.entity.ts`：Job 实体定义（支持 cron/every/at 三种类型）
- `src/cron-job-tool/src/job/job.service.ts`：任务管理服务（CRUD + 调度器控制 + 生命周期管理）
- `src/cron-job-tool/src/job/job-agent.service.ts`：AI 任务执行器（绑定多工具 + 自然语言指令解析）
- `src/cron-job-tool/src/job/job.module.ts`：Job 模块（TypeORM + ToolModule 依赖注入）

### 工具依赖

- `src/cron-job-tool/src/tool/tool.module.ts`：工具模块（提供搜索、邮件、数据库 CRUD 工具）
- `src/cron-job-tool/src/utils/detect-port.util.ts`：端口自动检测工具
- `src/cron-job-tool/src/utils/mail-template.util.ts`：Markdown 邮件模板渲染工具

---

## 🚀 如何运行

> 💡 源 README 未为本章单独提供运行说明。本章与 [第 14 章](./14-nest-tool-calling.md) 共享同一个 NestJS 项目（`src/cron-job-tool/`），启动方式相同：
>
> ```bash
> cd src/cron-job-tool
> pnpm install
> pnpm start:dev
> ```
>
> Job 模块的相关 API 路由可在 `src/cron-job-tool/src/job/` 中查看，启动后即可通过 HTTP 调用进行任务的创建、启停与状态查询。

---

## ✏️ 动手练习

> 💡 源 README 未为本章单独列出动手练习。可以结合 [第 14 章 Nest + Tool Calling 练习](./../exercises.md#-nest-tool-calling-ai-智能助手练习) 中的工具扩展、ReAct 循环相关练习举一反三。

---

## 🧭 章节导航

| ⬅️ 上一章 | 🏠 返回 | ➡️ 下一章 |
| --------- | ------- | --------- |
| [第 14 章 Nest + Tool Calling AI 智能助手](./14-nest-tool-calling.md) | [章节目录](./../../README.md#-章节目录) | [第 16 章 AGUI 协议：流式组件渲染](./16-agui-protocol.md) |
