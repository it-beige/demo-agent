import { Inject, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import type { Runnable } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class AiService {
  // 用于非流式一次性返回纯文本
  private readonly chain: Runnable;
  // 用于流式：不接 StringOutputParser，保留原始 chunk 以便读取思考内容
  private readonly streamingChain: Runnable;

  constructor(@Inject('CHAT_MODEL') private readonly model: ChatOpenAI) {
    const prompt = PromptTemplate.fromTemplate('请回答以下问题：\n\n{query}');
    this.chain = prompt.pipe(model).pipe(new StringOutputParser());
    this.streamingChain = prompt.pipe(model);
  }

  async runChain(query: string): Promise<string> {
    return this.chain.invoke({ query });
  }

  /**
   * 流式返回。通义千问等推理模型会先输出“思考过程”，此时 chunk.content 为空，
   * 思考内容位于 chunk.additional_kwargs.reasoning_content；思考结束后 content 才开始产出正式回答。
   * 若只取 content，前端在思考阶段会长时间看不到任何响应，故这里把两者分别产出。
   * 产出结构体 { type: 'reasoning' | 'answer', text }，由 controller 映射为 SSE 具名事件。
   */
  async *streamChain(
    query: string,
  ): AsyncGenerator<{ type: 'reasoning' | 'answer'; text: string }> {
    const stream = await this.streamingChain.stream({ query });
    for await (const chunk of stream) {
      // 不同厂商字段名可能不同（reasoning_content / reasoning），做一次兜底
      const reasoning =
        chunk?.additional_kwargs?.reasoning_content ??
        chunk?.additional_kwargs?.reasoning;
      if (reasoning) {
        yield { type: 'reasoning', text: String(reasoning) };
      }

      const content =
        typeof chunk?.content === 'string' ? chunk.content : '';
      if (content) {
        yield { type: 'answer', text: content };
      }
    }
  }
}
