#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('用法: pnpm dev <脚本路径>')
  console.log('示例:')
  console.log('  pnpm dev memory/retrieval-memory.mjs')
  console.log('  pnpm dev memory/insert-conversations.mjs')
  console.log('  pnpm dev memory/query-conversations.mjs')
  process.exit(1)
}

let scriptPath = args[0]

// 移除开头的 ./
scriptPath = scriptPath.replace(/^\.\//, '')

// 如果是相对路径,自动补全
if (!scriptPath.startsWith('/')) {
  // 尝试直接访问
  if (existsSync(scriptPath)) {
    // 文件存在,直接使用
  } else {
    // 尝试在 src/ 下查找
    const srcPath = `src/${scriptPath}`
    if (existsSync(srcPath)) {
      scriptPath = srcPath
    } else {
      // 尝试在 src/memory/ 下查找 (如果路径以 memory/ 开头)
      const memoryPath = `src/${scriptPath}`
      if (existsSync(memoryPath)) {
        scriptPath = memoryPath
      } else {
        console.error(`✗ 找不到文件: ${args[0]}`)
        console.error(`尝试过的路径:`)
        console.error(`  - ${scriptPath}`)
        console.error(`  - src/${scriptPath}`)
        process.exit(1)
      }
    }
  }
}

console.log(`运行: ${scriptPath}\n`)

try {
  execSync(`tsx --tsconfig tsconfig.json ${scriptPath}`, {
    stdio: 'inherit',
    cwd: resolve(process.cwd()),
  })
} catch (error) {
  process.exit(error.status || 1)
}
