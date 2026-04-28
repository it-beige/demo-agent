import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpeechService } from './speech.service';

@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  // 语音识别接口: POST /speech/recognize
  // 接收音频文件,返回识别文本(同步一句话识别,适合 60 秒以内短音频)
  @Post('recognize')
  @UseInterceptors(FileInterceptor('audio')) // 解析 multipart/form-data
  async recognize(
    @UploadedFile()
    file?: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        '请通过 FormData 的 audio 字段上传音频文件',
      );
    }

    const text = await this.speechService.recognizeBySentence(file);
    return { text };
  }
}
