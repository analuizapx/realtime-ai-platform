import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { InferenceService } from './inference.service';

// How often we push a new frame to connected clients
const STREAM_INTERVAL_MS = 500;

@WebSocketGateway({
  // Allow the Nuxt frontend to connect
  cors: { origin: true, credentials: true },
})
export class InferenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(InferenceGateway.name);

  @WebSocketServer()
  server: Server;

  // One timer per connected client so we can stop it on disconnect
  private timers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly inferenceService: InferenceService,
    private readonly jwtService: JwtService,
  ) {}

  // Called automatically when a client connects
  handleConnection(client: Socket) {
    // Token auth: accept it from the auth payload, the query string,
    // or the httpOnly access_token cookie sent by the browser.
    const token =
      client.handshake.auth?.token ||
      client.handshake.query?.token ||
      this.readCookieToken(client);

    if (!this.isValidToken(token)) {
      this.logger.warn(`Rejected unauthenticated socket ${client.id}`);
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect();
      return;
    }

    this.logger.log(`Client connected: ${client.id}`);
    this.startStreaming(client);
  }

  handleDisconnect(client: Socket) {
    this.stopStreaming(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Extract the access_token from the cookie header of the handshake
  private readCookieToken(client: Socket): string | undefined {
    const cookieHeader = client.handshake.headers?.cookie;
    if (!cookieHeader) return undefined;
    const match = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('access_token='));
    return match?.split('=')[1];
  }

  // Validate the JWT (same secret used for HTTP auth)
  private isValidToken(token: unknown): boolean {
    if (typeof token !== 'string' || !token) return false;
    try {
      this.jwtService.verify(token);
      return true;
    } catch {
      return false;
    }
  }

  // Push a fresh inference result every STREAM_INTERVAL_MS
  private startStreaming(client: Socket) {
    let counter = 0;

    const timer = setInterval(async () => {
      // Basic flow control: skip a tick if the socket buffer is backed up
      if (!client.connected) return;

      const frameId = `${client.id}-${counter++}`;
      try {
        const result = await this.inferenceService.runInference({
          requestId: frameId,
          frameId,
        });

        client.emit('frame', {
          ts: new Date().toISOString(),
          frameId,
          overlay: {
            boxes: result.ppe,
            emotions: result.emotions,
            risk: result.risk,
          },
        });
      } catch (err) {
        this.logger.error(`Streaming error: ${(err as Error).message}`);
        client.emit('error', { message: 'inference failed' });
      }
    }, STREAM_INTERVAL_MS);

    this.timers.set(client.id, timer);
  }

  private stopStreaming(clientId: string) {
    const timer = this.timers.get(clientId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(clientId);
    }
  }
}
