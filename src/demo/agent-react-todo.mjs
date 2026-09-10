import { runAgentWithTools } from '@/index.mjs'

const case1 = `创建一个功能丰富的 React TodoList 应用：

1. 用 pnpm create vite 创建 react-todo-app，react-ts 模板，跳过它的自动安装询问
2. src/App.tsx 实现完整的 TodoList：添加、删除、编辑、标记完成、
   分类筛选（全部/进行中/已完成）、统计信息、localStorage 持久化
3. 样式要足够精美：渐变背景（蓝到紫）、卡片阴影圆角、悬停效果，
   增删用 CSS transitions 做过渡动画
4. vite.config.ts 里配置 server.open，让启动后自动打开浏览器
5. 安装依赖、启动开发服务器，确认真的跑起来了，再把访问地址告给我

环境约束（这些你试错也未必看得出来，直接照做）：
- 用 pnpm。react-todo-app 不属于本仓库的 pnpm workspace，装依赖必须加
  --ignore-workspace，否则 pnpm 会去装整个 workspace 且退出码为 0，
  但本项目依赖一个都没装上
- dev 服务器是常驻进程，前台跑会把你卡死；用后台启动并把输出重定向到 dev.log
- command-execute 不会把命令输出回传给你，你只能看到成功/失败。
  所以结论要靠 file-read 读文件拿，或用 "命令 || exit 1" 转成退出码
`

try {
  await runAgentWithTools(case1)
} catch (error) {
  console.error(`\n❌ 错误: ${error.message}\n`)
}
