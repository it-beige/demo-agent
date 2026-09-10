#!/usr/bin/env node

import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('用法: pnpm dev <脚本路径> [脚本参数...]')
  console.log('示例:')
  console.log('  pnpm dev normal.mjs')
  console.log('  pnpm dev ./normal.mjs')
  console.log('  pnpm dev src/output-parse/normal.mjs')
  console.log('  pnpm dev ./src/output-parse/normal.mjs')
  console.log('  pnpm dev output-parse/normal.mjs')
  console.log('  pnpm dev memory/insert-conversations.mjs')
  console.log('  pnpm dev demo/mcp-amap.mjs "杭州西湖附近的景点"')
  process.exit(1)
}

let scriptPath = args[0]

// 首个参数之后的内容原样透传给目标脚本（对应脚本里的 process.argv.slice(2)）
// 过滤空串：VS Code 的 ${input:...} 在留空时会传入一个空参数
const scriptArgs = args.slice(1).filter(arg => arg !== '')

// 规范化路径:移除开头的 ./
scriptPath = scriptPath.replace(/^\.\//, '')

// 智能路径解析策略
function resolveScriptPath(inputPath) {
  const candidates = []

  // 策略1: 如果以 src/ 开头,直接使用
  if (inputPath.startsWith('src/')) {
    candidates.push(inputPath)
  } else {
    // 策略2: 直接路径 (根目录或 src 下的文件)
    candidates.push(inputPath)
    // 策略3: 在 src/ 下查找
    candidates.push(`src/${inputPath}`)
  }

  // 策略4: 在用户原始工作目录下查找 (支持在子目录中运行)
  // pnpm 会设置 INIT_CWD 为用户运行命令的目录
  const originalCwd = process.env.INIT_CWD || process.cwd()
  const cwdPath = resolve(originalCwd, inputPath)
  if (existsSync(cwdPath)) {
    return cwdPath
  }

  // 查找第一个存在的文件
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

// 如果是相对路径,自动补全
if (!scriptPath.startsWith('/')) {
  const resolvedPath = resolveScriptPath(scriptPath)

  if (!resolvedPath) {
    console.error(`✗ 找不到文件: ${args[0]}`)
    console.error(`尝试过的路径:`)
    console.error(`  - ${scriptPath}`)
    console.error(`  - src/${scriptPath}`)
    if (scriptPath.startsWith('src/')) {
      console.error(`  - ${scriptPath}`)
    }
    process.exit(1)
  }

  scriptPath = resolvedPath
}

console.log(`运行: ${scriptPath}\n`)

// 用数组形式传参，避免走 shell 时参数里的空格、引号、中文标点被二次解析
const result = spawnSync(
  'pnpm',
  ['exec', 'tsx', '--tsconfig', 'tsconfig.json', scriptPath, ...scriptArgs],
  {
    stdio: 'inherit',
    cwd: resolve(process.cwd()),
    env: { ...process.env, FORCE_COLOR: '0' },
  },
)

if (result.error) {
  console.error(`✗ 启动失败: ${result.error.message}`)
  process.exit(1)
}

process.exit(result.status ?? 1)
