import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ChatOpenAI } from '@langchain/openai';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [
    AiService,
    {
      provide: 'CHAT_MODEL',
      useFactory: (configService: ConfigService) => {
        return new ChatOpenAI({
          temperature: 0.7,
          model: configService.get('MODEL'),
          apiKey: configService.get('API_KEY'),
          configuration: {
            baseURL: configService.get('BASE_URL'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class AiModule {}
