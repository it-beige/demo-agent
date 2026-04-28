import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { Server, WebSocket } from 'ws';
import { TtsRelayService } from '../speech/tts-relay.service';

// WebSocket 网关:处理前端 TTS 连接
// 真正的会话注册、sessionId 下发、关闭等逻辑都委托给 TtsRelayService
@WebSocketGateway({
  path: '/tts', // WebSocket 路径: ws://localhost:3000/tts
})
export class TtsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly ttsRelayService: TtsRelayService) {}

  // 客户端连接时:从 query 中读取 wantedSessionId(可选,用于断线重连),交给 relay 注册
  handleConnection(client: WebSocket, request?: IncomingMessage) {
    const reqUrl = new URL(request?.url ?? '', 'http://localhost');
    const wantedSessionId = reqUrl.searchParams.get('sessionId') ?? undefined;
    const sessionId = this.ttsRelayService.registerClient(
      client,
      wantedSessionId,
    );
    (client as any).sessionId = sessionId;
  }

  // 客户端断开时:通知 relay 清理对应会话
  handleDisconnect(client: WebSocket) {
    const sessionId = (client as any).sessionId as string | undefined;
    if (sessionId) {
      this.ttsRelayService.unregisterClient(sessionId);
    }
  }
}
