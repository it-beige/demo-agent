// AI 与 TTS 之间的事件通道标识符
export const AI_TTS_STREAM_EVENT = 'ai.tts.stream';

// 流式事件类型定义(联合类型)
export type AiTtsStreamEvent =
  | { type: 'start'; sessionId: string; query: string } // AI 开始输出
  | { type: 'chunk'; sessionId: string; chunk: string } // AI 输出一段文本
  | { type: 'end'; sessionId: string } // AI 输出完成
  | { type: 'error'; sessionId: string; error: string }; // AI 出错
