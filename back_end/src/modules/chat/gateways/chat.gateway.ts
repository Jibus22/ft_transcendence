import {
  GatewayMetadata,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from '../../users/entities/users.entity';
import { ChatMessageDto } from '../dto/chatMessade.dto';
import { ParticipantDto } from '../dto/participant.dto';
import { RestrictionDto } from '../dto/restriction.dto';
import { RoomDto } from '../dto/room.dto';
import { Room } from '../entities/room.entity';
import { ChatGatewayService } from './chatGateway.service';

export class ISocketStorage {
  storage = new Map<string, Socket>();
}

export type messageType =
  | ChatMessageDto
  | RoomDto
  | ParticipantDto
  | RestrictionDto;

const options: GatewayMetadata = {
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
};

@WebSocketGateway(options)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private clientSockets: ISocketStorage,
    private readonly chatGatewayService: ChatGatewayService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.server = server;
  }

  async handleConnection(client: Socket) {
    await this.chatGatewayService
      .handleConnection(this.server, client)
      .then(() => {
        this.clientSockets.storage.set(client.id, client);
      });
  }

  async handleDisconnect(client: Socket) {
    await this.chatGatewayService
      .handleDisconnect(this.server, client)
      .then(() => {
        this.clientSockets.storage.delete(client.id);
      });
  }

  sendEventToServer(event: string, message: messageType) {
    return this.chatGatewayService.sendEventToServer(
      this.server,
      event,
      message,
    );
  }

  sendEventToRoom(room: Room, event: string, message: messageType) {
    return this.chatGatewayService.sendEventToRoom(
      this.server,
      room.id,
      event,
      message,
    );
  }

  sendEventToClient(user: User, event: string, message: messageType) {
    return this.chatGatewayService.sendEventToRoom(
      this.server,
      user.ws_id,
      event,
      message,
    );
  }

  makeClientJoinRoom(user: User, room: Room) {
    const clientSocket = this.clientSockets.storage.get(user.ws_id);
    if (clientSocket) {
      this.chatGatewayService.makeClientJoinRoom(clientSocket, room);
    }
  }

  makeClientLeaveRoom(user: User, room: Room) {
    const clientSocket = this.clientSockets.storage.get(user.ws_id);
    if (clientSocket) {
      this.chatGatewayService.makeClientLeaveRoom(clientSocket, room);
    }
  }

  // @UsePipes(new ValidationPipe({
  //   whitelist: true
  // }))
  // @SubscribeMessage('ingame')
  // async updateIngane(client: Socket, data: { value: 'in' | 'out' }) {
  //   return await this.chatGatewayService.setUserIngame(client, data);
  // }
}
