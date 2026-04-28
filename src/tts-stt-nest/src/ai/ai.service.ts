import { Inject, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AI_TTS_STREAM_EVENT, AiTtsStreamEvent } from '../common/stream-events';

@Injectable()
export class AiService {
  // LangChain 链:提示词 → 模型 → 输出解析器
  private chain: any;

  constructor(
    @Inject('CHAT_MODEL') private readonly model: ChatOpenAI,
    private eventEmitter: EventEmitter2, // 事件发射器,用于通知 TTS 服务
  ) {
    this.initializeChain();
  }

  // 初始化 LangChain 链
  private initializeChain() {
    // 提示词模板
    const prompt = PromptTemplate.fromTemplate(
      '你是一个智能助手,请回答用户的问题。\n\n用户问题:{query}',
    );

    // 组装链:prompt.pipe(model) 将提示词传给模型,再 pipe 到输出解析器提取文本
    this.chain = prompt.pipe(this.model).pipe(new StringOutputParser());
  }

  // 流式生成 AI 回答,同时触发 TTS 事件
  // ttsSessionId 可选:如果提供则同步触发语音合成
  async *streamChain(
    query: string,
    ttsSessionId?: string,
  ): AsyncGenerator<string> {
    try {
      // 获取流式输出
      const stream = await this.chain.stream({ query });

      // AI 开始输出前,通知 TTS 服务建立连接
      if (ttsSessionId) {
        const startEvent: AiTtsStreamEvent = {
          type: 'start',
          sessionId: ttsSessionId,
          query,
        };
        this.eventEmitter.emit(AI_TTS_STREAM_EVENT, startEvent);
      }

      // 逐块输出 AI 回答,每块都触发 TTS 合成
      for await (const chunk of stream) {
        if (ttsSessionId) {
          const event: AiTtsStreamEvent = {
            type: 'chunk',
            sessionId: ttsSessionId,
            chunk, // 文本片段,可能是字或词
          };
          this.eventEmitter.emit(AI_TTS_STREAM_EVENT, event);
        }
        // yield 返回给 SSE 客户端(显示文字)
        yield chunk;
      }

      // AI 输出完成,通知 TTS 服务结束
      if (ttsSessionId) {
        const endEvent: AiTtsStreamEvent = {
          type: 'end',
          sessionId: ttsSessionId,
        };
        this.eventEmitter.emit(AI_TTS_STREAM_EVENT, endEvent);
      }
    } catch (error) {
      // AI 出错时也通知 TTS 服务
      if (ttsSessionId) {
        const errorEvent: AiTtsStreamEvent = {
          type: 'error',
          sessionId: ttsSessionId,
          error: error instanceof Error ? error.message : String(error),
        };
        this.eventEmitter.emit(AI_TTS_STREAM_EVENT, errorEvent);
      }
      throw error;
    }
  }
}
