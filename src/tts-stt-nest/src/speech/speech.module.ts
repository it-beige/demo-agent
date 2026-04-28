import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import { SpeechService } from './speech.service';
import { SpeechController } from './speech.controller';
import { TtsRelayService } from './tts-relay.service';

const AsrClient = tencentcloud.asr.v20190614.Client;

@Module({
  imports: [ConfigModule],
  providers: [
    SpeechService,
    {
      provide: TtsRelayService,
      useFactory: (configService: ConfigService) =>
        new TtsRelayService(configService),
      inject: [ConfigService],
    },
    // 自定义 Provider:工厂模式创建 ASR 客户端
    {
      provide: 'ASR_CLIENT', // 注入时的标识符
      useFactory: (configService: ConfigService) => {
        // 从环境变量读取密钥,动态创建客户端
        return new AsrClient({
          credential: {
            secretId: configService.get<string>('SECRET_ID'),
            secretKey: configService.get<string>('SECRET_KEY'),
          },
          region: 'ap-shanghai',
          profile: {
            httpProfile: {
              reqMethod: 'POST',
              reqTimeout: 30, // 音频识别耗时,设置 30s 超时
            },
          },
        });
      },
      inject: [ConfigService], // 声明依赖,自动注入
    },
  ],
  controllers: [SpeechController],
  exports: [TtsRelayService], // 导出给 GatewaysModule 使用
})
export class SpeechModule {}
