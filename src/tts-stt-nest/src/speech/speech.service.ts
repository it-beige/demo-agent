import { Inject, Injectable } from '@nestjs/common';
import type * as tencentcloud from 'tencentcloud-sdk-nodejs';

type UploadedAudio = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

type AsrClient = InstanceType<typeof tencentcloud.asr.v20190614.Client>;

@Injectable()
export class SpeechService {
  // 注入 ASR 客户端(在 speech.module.ts 中通过工厂模式创建)
  constructor(@Inject('ASR_CLIENT') private readonly asrClient: AsrClient) {}

  // 一句话识别:同步返回识别结果(适合 60 秒以内的短音频)
  async recognizeBySentence(file: UploadedAudio): Promise<string> {
    const audioBase64 = file.buffer.toString('base64');

    const result = await this.asrClient.SentenceRecognition({
      EngSerViceType: '16k_zh', // 16k 采样率中文普通话
      SourceType: 1, // 1:音频数据(Data 字段)
      Data: audioBase64, // Base64 编码音频
      DataLen: file.buffer.length, // 数据长度
      VoiceFormat: 'ogg-opus', // 前端 MediaRecorder 默认输出格式
    });

    return result.Result ?? '';
  }

  // 兼容旧调用:接受 Buffer 也能识别
  async recognizeAudio(audioBuffer: Buffer): Promise<string> {
    return this.recognizeBySentence({
      buffer: audioBuffer,
      originalname: 'record.ogg',
      mimetype: 'audio/ogg',
      size: audioBuffer.length,
    });
  }
}
