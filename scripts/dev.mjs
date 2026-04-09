#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync, readdirSync } from 'fs'
import { resolve, join, dirname } from 'path'

const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('用法: pnpm dev <脚本路径>')
  console.log('示例:')
  console.log('  pnpm dev memory/retrieval-memory.mjs')
  console.log('  pnpm dev mivlus/book-test/ebook-writer.mjs')
  console.log('  pnpm dev ebook-writer.mjs  (自动查找)')
  process.exit(1)
}

let scriptPath = args[0]

// 移除开头的 ./
scriptPath = scriptPath.replace(/^\.\//, '')

/**
 * 递归查找文件
 */
function findFile(dir, filename) {
  try {
    const files = readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
      const fullPath = join(dir, file.name)
      if (file.isDirectory()) {
        // 跳过 node_modules 和 .git
        if (file.name === 'node_modules' || file.name === '.git') continue
        const found = findFile(fullPath, filename)
        if (found) return found
      } else if (file.name === filename) {
        return fullPath
      }
    }
  } catch (error) {
    // 忽略权限错误等
  }
  return null
}

// 路径解析逻辑
if (!scriptPath.startsWith('/')) {
  // 1. 尝试直接访问
  if (existsSync(scriptPath)) {
    // 文件存在,直接使用
  }
  // 2. 尝试在 src/ 下查找
  else if (existsSync(`src/${scriptPath}`)) {
    scriptPath = `src/${scriptPath}`
  }
  // 3. 如果只提供了文件名,在 src/ 下递归查找
  else if (!scriptPath.includes('/')) {
    const found = findFile('src', scriptPath)
    if (found) {
      scriptPath = found
    } else {
      console.error(`✗ 找不到文件: ${args[0]}`)
      console.error(`尝试过的路径:`)
      console.error(`  - ${scriptPath}`)
      console.error(`  - src/${scriptPath}`)
      console.error(`  - src/**/${scriptPath} (递归查找)`)
      process.exit(1)
    }
  }
  // 4. 提供了相对路径但找不到
  else {
    console.error(`✗ 找不到文件: ${args[0]}`)
    console.error(`尝试过的路径:`)
    console.error(`  - ${scriptPath}`)
    console.error(`  - src/${scriptPath}`)
    console.error('')
    console.error('提示: 使用相对于 src/ 的路径,例如:')
    console.error('  pnpm dev mivlus/book-test/ebook-writer.mjs')
    process.exit(1)
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
