import { Controller, Get, Query, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AiService } from './ai.service';
import { map } from 'rxjs/operators';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  // SSE 端点: GET /ai/chat?query=xxx&ttsSessionId=yyy
  // 返回 Observable 实现流式输出
  @Sse('chat')
  chat(
    @Query('query') query: string,
    @Query('ttsSessionId') ttsSessionId?: string,
  ): Observable<MessageEvent> {
    // 获取 AI 流式生成器
    const stream = this.aiService.streamChain(query, ttsSessionId);

    // 将 AsyncGenerator 转换为 Observable,适配 NestJS SSE
    return new Observable<MessageEvent>((subscriber) => {
      (async () => {
        try {
          // 逐块推送给客户端
          for await (const chunk of stream) {
            subscriber.next({ data: chunk });
          }
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      })();
    });
  }
}
