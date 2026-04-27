import * as net from 'net';

/**
 * 检测指定端口是否可用，如果被占用则自动递增，直到找到空闲端口。
 *
 * @param preferredPort 期望的端口号
 * @param maxAttempts 最大尝试次数（默认 20）
 * @returns 可用的端口号
 */
export async function detectAvailablePort(
  preferredPort: number,
  maxAttempts = 20,
): Promise<number> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const port = preferredPort + attempt;
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  throw new Error(
    `端口 ${preferredPort}-${preferredPort + maxAttempts - 1} 全部被占用，无法启动服务。`,
  );
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '0.0.0.0');
  });
}
