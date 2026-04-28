import { Module } from '@nestjs/common';
import { TtsGateway } from './tts.gateway';
import { SpeechModule } from '../speech/speech.module';

@Module({
  imports: [SpeechModule],
  providers: [TtsGateway],
})
export class GatewaysModule {}
