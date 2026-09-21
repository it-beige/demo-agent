import { Controller, Sse, Query, MessageEvent } from '@nestjs/common';
import { AiService } from './ai.service';
import { from, map, Observable } from 'rxjs';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @Sse('chat/stream')
  chatStream(@Query('query') query: string): Observable<MessageEvent> {
    return from(this.aiService.streamChain(query)).pipe(
      // type -> SSE 事件名（reasoning / answer），data 只放纯文本，前端按事件名分区渲染
      map((chunk) => ({ data: chunk.text, type: chunk.type })),
    );
  }
}
