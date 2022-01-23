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
import { ChatMessageDto } from '../dto/chatMessade.dto';
import { ParticipantDto } from '../dto/participant.dto';
import { RestrictionDto } from '../dto/restriction.dto';
import { RoomDto } from '../dto/room.dto';
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

@WebSocketGateway(options)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatGatewayService: ChatGatewayService) {}

  @WebSocketServer() server: Server;
  storage: Map<string, Socket>;

  afterInit(server: Server) {
    console.log('INIT HERE -----------------------------');
    this.server = server;
  }

  async handleConnection(client: Socket) {
    await this.chatGatewayService.handleConnection(client);
  }

  async handleDisconnect(client: Socket) {
    await this.chatGatewayService.handleDisconnect(client);
  }

  // @UsePipes(new ValidationPipe({
  //   whitelist: true
  // }))
  // @SubscribeMessage('ingame')
  // async updateIngane(client: Socket, data: { value: 'in' | 'out' }) {
  //   console.log('get ingame');
  //   return await this.chatGatewayService.setUserIngame(client, data);
  // }
}
