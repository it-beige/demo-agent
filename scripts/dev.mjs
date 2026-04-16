#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync, readdirSync } from 'fs'
import { resolve, join, dirname } from 'path'

const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('用法: pnpm dev <脚本路径>')
  console.log('示例:')
  console.log('  pnpm dev normal.mjs')
  console.log('  pnpm dev ./normal.mjs')
  console.log('  pnpm dev src/output-parse/normal.mjs')
  console.log('  pnpm dev ./src/output-parse/normal.mjs')
  console.log('  pnpm dev output-parse/normal.mjs')
  console.log('  pnpm dev memory/insert-conversations.mjs')
  process.exit(1)
}

let scriptPath = args[0]

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

try {
  execSync(`pnpm exec tsx --tsconfig tsconfig.json ${scriptPath}`, {
    stdio: 'inherit',
    cwd: resolve(process.cwd()),
    env: { ...process.env, FORCE_COLOR: '0' },
  })
} catch (error) {
  process.exit(error.status || 1)
}
