import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpeechModule } from './speech/speech.module';
import { AiModule } from './ai/ai.module';
import { GatewaysModule } from './gateways/gateways.module';
import { getEnvFilePath } from './utils/config.util';

@Module({
  imports: [
    // 全局配置模块,自动加载 .env 文件
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(),
    }),
    // 事件总线模块,用于模块间解耦通信
    EventEmitterModule.forRoot(),
    // 静态文件服务,托管前端页面
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    // 业务功能模块
    SpeechModule, // 语音处理(ASR/TTS)
    AiModule, // AI 对话(LangChain)
    GatewaysModule, // WebSocket 网关
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    console.log(
      '📦 tts-stt-nest 模块已加载：Speech (ASR/TTS) + AI + WebSocket',
    );
  }
}
