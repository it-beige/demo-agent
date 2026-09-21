#!/usr/bin/env node

import { spawn } from 'child_process'
import { existsSync, statSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

// 当前打开的文件路径由 VS Code 的 ${file} 传入
const filePath = process.argv[2]

if (!filePath) {
  console.error(
    '✗ 未收到文件路径。请在某个 Nest 项目内的文件中启动该调试配置。',
  )
  process.exit(1)
}

// 仓库根目录（scripts/ 的上一级）
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// 从当前文件所在目录向上查找，定位包含 nest-cli.json 的项目根目录
function findNestProjectDir(startPath) {
  let dir = existsSync(startPath) ? startPath : repoRoot
  // 若传入的是文件，从其所在目录开始
  try {
    if (statSync(dir).isFile()) dir = dirname(dir)
  } catch {
    dir = dirname(dir)
  }

  while (true) {
    if (existsSync(resolve(dir, 'nest-cli.json'))) {
      return dir
    }
    const parent = dirname(dir)
    if (parent === dir || dir === repoRoot) break
    dir = parent
  }
  return null
}

const projectDir = findNestProjectDir(filePath)

if (!projectDir) {
  console.error(
    `✗ 未能从当前文件推断出 Nest 项目（向上未找到 nest-cli.json）。`,
  )
  console.error(`  当前文件: ${filePath}`)
  process.exit(1)
}

// 复用仓库根目录下的 Nest CLI（pnpm workspace 已提升到根）
const nestCli = resolve(repoRoot, 'node_modules/@nestjs/cli/bin/nest.js')

if (!existsSync(nestCli)) {
  console.error(`✗ 找不到 Nest CLI: ${nestCli}`)
  console.error(`  请先在仓库根目录执行 pnpm install。`)
  process.exit(1)
}

console.log(`调试 Nest 项目: ${projectDir}\n`)

const child = spawn(
  process.execPath,
  [nestCli, 'start', '--debug', '--watch'],
  {
    stdio: 'inherit',
    cwd: projectDir,
    env: { ...process.env },
  },
)

// 转发退出信号，保证 Ctrl-C / 停止调试能干净关闭子进程
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => child.kill(sig))
}

child.on('exit', code => process.exit(code ?? 1))
child.on('error', err => {
  console.error(`✗ 启动失败: ${err.message}`)
  process.exit(1)
})
