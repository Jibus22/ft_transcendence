import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  GatewayMetadata,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
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

export enum Events {
  CONNECT = 'connect',
  PUBLIC_ROOM_CREATED = 'publicRoomCreated',
  PUBLIC_ROOM_UPDATED = 'publicRoomUpdated',
  PUBLIC_ROOM_REMOVED = 'publicRoomRemoved',
  NEW_MESSAGE = 'newMessage',
  ROOM_PARTICIPANTS_UPDATED = 'roomParticipantUpdated',
  USER_ADDED = 'userAdded',
  USER_REMOVED = 'userRemoved',
  USER_MODERATION = 'userModeration',
  USER_BANNED = 'userBanned',
  USER_MUTED = 'userMuted',
}

export type messageType =
  | { id: string }
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

const options_game: GatewayMetadata = {
  namespace: 'game',
  cors: {
    origin: ['http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
};

@WebSocketGateway(options_game)
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.server = server;
  }
  async handleConnection(client: Socket) {
    console.log(' NEW SOCKET ----------  connect GAME WS -> ', client.id);
  }

  async handleDisconnect(client: Socket) {
    console.log(' NEW SOCKET ----------  disconnect GAME WS -> ', client.id);
  }
}

@WebSocketGateway(options)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  storage: Map<string, Socket>;
  constructor(private readonly chatGatewayService: ChatGatewayService) {
    this.storage = new Map<string, Socket>();
  }

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.server = server;
  }

  async handleConnection(client: Socket) {
    await this.chatGatewayService
      .handleConnection(this.server, client)
      .then(() => {
        this.storage.set(client.id, client);
      });
  }

  async handleDisconnect(client: Socket) {
    await this.chatGatewayService
      .handleDisconnect(this.server, client)
      .then(() => {
        this.storage.delete(client.id);
      });
  }

  sendEventToServer(event: string, message: messageType) {
    if (process.env.NODE_ENV === 'dev') {
      console.log('Emit event to SERVER: ', event);
    }
    return this.chatGatewayService.sendEventToServer(
      this.server,
      event,
      message,
    );
  }

  sendEventToRoom(room: Room | Room[], event: string, message: messageType) {
    if (process.env.NODE_ENV === 'dev') {
      console.log('Emit event to ROOM: ', event);
    }
    const dest = Array.isArray(room) ? room.map((r) => r.id) : room.id;
    return this.chatGatewayService.sendEventToRoom(
      this.server,
      dest,
      event,
      message,
    );
  }

  sendEventToClient(user: User, event: string, message: messageType) {
    if (process.env.NODE_ENV === 'dev') {
      console.log('Emit event to CLIENT: ', event);
    }
    return this.chatGatewayService.sendEventToRoom(
      this.server,
      user.ws_id,
      event,
      message,
    );
  }

  async makeClientJoinRoom(user: User, room: Room) {
    if (process.env.NODE_ENV === 'dev') {
      console.log(`Add client ${user?.login} to room ${room.id}`);
    }
    const clientSocket = this.storage.get(user.ws_id);
    if (clientSocket) {
      await this.chatGatewayService.makeClientJoinRoom(clientSocket, room);
    }
  }

  async makeClientLeaveRoom(user: User, room: Room) {
    if (process.env.NODE_ENV === 'dev') {
      console.log(`Remove client ${user?.login} to room ${room.id}`);
    }
    const clientSocket = this.storage.get(user.ws_id);
    if (clientSocket) {
      await this.chatGatewayService.makeClientLeaveRoom(clientSocket, room);
    }
  }

  // @UsePipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //   }),
  // )
  @SubscribeMessage('ingame')
  async updateIngane(client: Socket, data: { value: 'in' | 'out' }) {
    return await this.chatGatewayService.setUserIngame(client, data);
  }
}
