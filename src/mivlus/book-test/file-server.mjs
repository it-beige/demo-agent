/**
 * 简单的 HTTP 文件服务器
 * 用于为阿里云批处理 embedding API 提供可访问的文件 URL
 */

import { createServer } from 'http'
import { readFileSync, statSync } from 'fs'
import { extname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { loadEnvFromNearest } from '../../shared/config.util.mjs'

// 加载环境变量（仅需 env，不引入 model.mjs 避免多创建 LLM 客户端）
loadEnvFromNearest(import.meta.url)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = parseInt(process.env.FILE_SERVER_PORT) || 8080
// resolve 一下：若 env 里给的是相对路径，不做归一化会让下方的目录遍历检查误判
const BASE_DIR = resolve(process.env.FILE_SERVER_BASE_DIR ?? process.cwd())

// MIME 类型映射
const mimeTypes = {
  '.txt': 'text/plain',
  '.json': 'application/json',
  '.gz': 'application/gzip',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
}

const server = createServer((req, res) => {
  let filePath = join(BASE_DIR, req.url === '/' ? '' : req.url)

  // 安全检查：防止目录遍历攻击
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' })
    res.end('Forbidden')
    return
  }

  try {
    const stats = statSync(filePath)

    if (stats.isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
      return
    }

    const ext = extname(filePath).toLowerCase()
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*', // 允许跨域访问
    })

    const fileStream = readFileSync(filePath)
    res.end(fileStream)
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Internal Server Error')
    }
  }
})

server.listen(PORT, () => {
  console.log(`文件服务器运行在 http://localhost:${PORT}`)
  console.log(`基础目录: ${BASE_DIR}`)
  console.log(`按 Ctrl+C 停止服务器`)
})

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...')
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })
})

export default server
