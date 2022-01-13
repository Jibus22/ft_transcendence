import {
  GatewayMetadata,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { Room } from '../entities/room.entity';
import { ChatGatewayService } from './chatGateway.service';

const options: GatewayMetadata = {
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
};

@WebSocketGateway(options)
export class ChatGateway {
  constructor(private readonly chatGatewayService: ChatGatewayService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.server = server;
  }

  async handleConnection(client: Socket) {
    return this.chatGatewayService.handleConnection(this.server, client);
  }

  async handleDisconnect(client: Socket) {
    return this.chatGatewayService.handleDisconnect(this.server, client);
  }

  broadcastEventToServer(event: string, message: string) {
    return this.chatGatewayService.broadcastEventToServer(
      this.server,
      event,
      message,
    );
  }

  broadcastEventToRoom(room: Room, event: string, message: string) {
    return this.chatGatewayService.broadcastEventToRoom(
      this.server,
      room,
      event,
      message,
    );
  }

  // @UsePipes(new ValidationPipe({
  //   whitelist: true
  // }))
  // @SubscribeMessage('ingame')
  // async updateIngane(client: Socket, data: { value: 'in' | 'out' }) {
  //   return await this.chatGatewayService.setUserIngame(client, data);
  // }
}
