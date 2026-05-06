# [NestJS·Cron] AI 定时任务：自然语言描述 → 自动调度执行

> 基于 TypeORM + SchedulerRegistry 实现 OpenClaw 风格的 AI 定时任务：用户用自然语言描述任务，系统到时自动调用 AI Agent 执行。
> **关键词**：SchedulerRegistry、TypeORM、Cron、定时任务、自然语言调度

## 核心设计

传统的定时任务是写死的脚本，这个 demo 把"任务内容"从代码中解耦出来：

- **任务定义**：Job Entity 支持三种调度类型——cron 表达式、interval 间隔、at 一次性
- **任务管理**：CRUD + 动态启停 + 运行状态追踪 + 执行时间记录，持久化到 SQLite/MySQL
- **任务执行**：`JobAgentService` 绑定第 14 章的三个工具（搜索/邮件/数据库），用 AI 理解自然语言指令并自动完成
- **启动恢复**：`OnApplicationBootstrap` 钩子自动加载已启用任务，恢复调度器状态

这套设计让非技术人员也能创建定时任务——只需用自然语言说"每天早上 9 点搜索 AI 新闻并发邮件给我"。

与第 14 章共享同一个 NestJS 项目 `src/cron-job-tool/`。

## 运行方式

```bash
cd src/cron-job-tool
pnpm install
pnpm start:dev
```

启动后通过 Job 模块的 API 端点进行任务的创建、启停和状态查询。

## 扩展方向

- 增加任务执行历史持久化和失败重试机制
- 将任务存储从 SQLite 升级为 Postgres/MySQL
- 增加任务执行结果的通知推送（钉钉/飞书/邮件）

---
⬅️ [Nest Tool Calling](./14-nest-tool-calling.md) ｜ [📚 目录](../../README.md#目录) ｜ [AGUI 流式组件 ➡️](./16-agui-protocol.md)