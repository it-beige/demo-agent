import * as WebSocket from 'ws';
import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, WebSocket as WebSocketServer } from 'ws';

export class WsAdapter extends IoAdapter {
  constructor(appOrHttpServer?: INestApplicationContext | any) {
    super(appOrHttpServer);
  }

  create(port: number, options?: any): any {
    const server = new Server({ port, ...options });
    return server;
  }

  bindClientConnect(server: any, callback: Function) {
    server.on('connection', (ws: WebSocketServer, req: any) => {
      callback(ws, req);
    });
  }

  bindClientDisconnect(client: any, callback: Function) {
    client.on('close', callback);
  }

  bindMessageHandlers(client: any, handlers: any, process: (data: any) => any) {
    client.on('message', (data: any) => {
      const message = JSON.parse(data);
      const handler = handlers[message.event];
      if (handler) {
        handler(message.data);
      }
    });
  }

  async close(server: any) {
    server.close();
  }
}
