import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { detectAvailablePort } from './utils/detect-port.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const preferredPort = Number(process.env.PORT) || 3000;
  const actualPort = await detectAvailablePort(preferredPort);

  await app.listen(actualPort);

  if (actualPort !== preferredPort) {
    console.log(
      `⚠️  端口 ${preferredPort} 已被占用，自动切换到端口 ${actualPort}`,
    );
  }
  console.log(
    `🚀 asr-and-tts-nest-service 已启动: http://localhost:${actualPort}`,
  );
}
bootstrap();
