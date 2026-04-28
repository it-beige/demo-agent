import * as net from 'net';

/**
 * 检测指定端口是否可用,如果被占用则自动递增,直到找到空闲端口
 */
export async function detectAvailablePort(
  preferredPort: number,
  maxAttempts = 20, // 最多尝试 20 个端口
): Promise<number> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const port = preferredPort + attempt;
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  throw new Error(
    `端口 ${preferredPort}-${preferredPort + maxAttempts - 1} 全部被占用,无法启动服务。`,
  );
}

// 检测单个端口是否可用:尝试监听,成功则可用,失败则被占用
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false); // 端口被占用
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close(() => resolve(true)); // 端口可用,立即关闭
    });

    server.listen(port, '0.0.0.0');
  });
}
