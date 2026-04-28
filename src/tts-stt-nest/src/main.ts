import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { detectAvailablePort } from './utils/detect-port.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useWebSocketAdapter(new WsAdapter(app));

  // 端口检测:优先使用配置端口,被占用则自动递增
  const preferredPort = Number(process.env.PORT) || 3000;
  const actualPort = await detectAvailablePort(preferredPort);

  await app.listen(actualPort);

  if (actualPort !== preferredPort) {
    console.log(
      `⚠️  端口 ${preferredPort} 已被占用,自动切换到端口 ${actualPort}`,
    );
  }
  console.log(`🚀 tts-stt-nest 已启动: http://localhost:${actualPort}`);
}
bootstrap();
