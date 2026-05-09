import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class WebsocketService {
  private server?: Server;

  setServer(server: Server): void {
    this.server = server;
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server?.to(`user:${userId}`).emit(event, payload);
  }

  emitToRole(role: string, event: string, payload: unknown): void {
    this.server?.to(`role:${role}`).emit(event, payload);
  }
}
