import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import {
  GatewayMetadata,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import { UpdateUserDto } from '../../users/dtos/update-users.dto';
import { UserDto } from '../../users/dtos/user.dto';
import { User } from '../../users/entities/users.entity';
import { UsersService } from '../../users/service-users/users.service';
import { ChatMessageDto } from '../dto/chatMessade.dto';
import { ParticipantDto } from '../dto/participant.dto';
import { RestrictionDto } from '../dto/restriction.dto';
import { RoomDto } from '../dto/room.dto';
import { Room } from '../entities/room.entity';

export enum Events {
  CONNECT = 'connect',
  PUBLIC_ROOM_CREATED = 'publicRoomCreated',
  PUBLIC_ROOM_UPDATED = 'publicRoomUpdated',
  PUBLIC_ROOM_REMOVED = 'publicRoomRemoved',
  NEW_MESSAGE = 'newMessage',
  ROOM_PARTICIPANTS_UPDATED = 'roomParticipantUpdated',
  PUBLIC_USER_INFOS_UPDATED = 'publicUserInfosUpdated',
  USER_ADDED = 'userAdded',
  USER_REMOVED = 'userRemoved',
  USER_MODERATION = 'userModeration',
  USER_BANNED = 'userBanned',
}

export type messageType =
  | UserDto
  | ChatMessageDto
  | RoomDto
  | ParticipantDto
  | RestrictionDto;

const options: GatewayMetadata = {
  namespace: 'chat',
  cors: {
    origin: [
      `http://${process.env.SERVER_IP}`,
      `http://${process.env.SERVER_IP}:${process.env.FRONT_PORT}`,
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
};

@WebSocketGateway(options)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer() server: Server;

  private readonly logger = new Logger('ChatGateway');

  afterInit(server: Server) {
    this.logger.log('Init Gateway');
    this.server = server;
  }

  async handleConnection(client: Socket) {
    this.logger.debug('ws chat 🍄  connect -> ', client.id);
    await this.doHandleConnection(client);
  }

  async handleDisconnect(client: Socket) {
    this.logger.debug('ws chat 🍄 disconnected -> ', client.id);
    await this.doHandleDisconnect(client);
  }

  // @UsePipes(new ValidationPipe({
  //   whitelist: true
  // }))
  // @SubscribeMessage('ingame')
  // async updateIngane(client: Socket, data: { value: 'in' | 'out' }) {
  //   this.logger.debug('get ingame');
  //   return await this.chatGatewayService.setUserIngame(client, data);
  // }

  /*
	===================================================================
	-------------------------------------------------------------------
				UTILS FUNCTIONS
	-------------------------------------------------------------------
	===================================================================
	*/

  private async joinRoomsAtConnection(client: Socket, user: User) {
    await this.usersService.findRoomParticipations(user.id).then((rooms) => {
      if (rooms.length) {
        client.join(rooms.map((r) => r.id));
      }
    });
  }

  private async updateUser(client: Socket, userData: UpdateUserDto) {
    await this.usersService
      .find({ ws_id: client.id })
      .then(async (users) => {
        if (users[0]) {
          await this.usersService.update(users[0].id, userData);
        }
      })
      .catch((error) => {
        this.logger.debug(error.message);
        client._error({ message: error.message });
        return client.disconnect();
      });
  }

  private async getUserIdFromToken(token: string) {
    if (token) {
      return await this.cacheManager.get<string>(token);
    }
  }

  private doHandleConnectionFailure(client: Socket, errorMessage: string) {
    this.logger.debug(
      `handleConnectionFAILURE: client ${client.id} disconnected !🛑  -> `,
      errorMessage,
    );
    client._error({ message: errorMessage });
    return client.disconnect();
  }

  /*
	===================================================================
	-------------------------------------------------------------------
				SOCKET MANAGEMENT
	-------------------------------------------------------------------
	===================================================================
	*/

  async doHandleConnection(client: Socket) {
    const { key: token } = client.handshake.auth;
    const userId = await this.getUserIdFromToken(token).catch((error) => {
      this.doHandleConnectionFailure(client, error.message);
    });

    if (!userId) {
      return this.doHandleConnectionFailure(client, 'invalid token');
    }
    this.logger.log(`handleConnection: ${client.id} | token ${token}`);

    await this.usersService
      .update(userId, {
        ws_id: client.id,
      })
      .catch((error) => {
        this.doHandleConnectionFailure(client, error.message);
      })
      .then(async (user: User) => {
        this.logger.log(`handleConnection: Client connected ! ✅`);
        return await this.joinRoomsAtConnection(client, user);
      })
      .catch((error) => {
        this.doHandleConnectionFailure(client, error.message);
      });
  }

  async doHandleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    await this.updateUser(client, {
      ws_id: null,
      is_in_game: false,
    });
  }

  private async getClientSocket(ws_id: string) {
    if (ws_id === null) return undefined;

    const sockets = await this.server.fetchSockets();
    const clientSocket = sockets.filter((s) => s.id === ws_id);
    if (clientSocket.length) {
      return clientSocket[0];
    }
    return undefined;
  }

  async makeClientJoinRoom(user: User, room: Room) {
    this.logger.debug(`Add client ${user?.login} to room ${room.id}`);
    const clientSocket = await this.getClientSocket(user.ws_id);
    if (clientSocket) {
      await clientSocket.join(room.id);
    }
  }

  async makeClientLeaveRoom(user: User, room: Room) {
    this.logger.debug(`Remove client ${user?.login} from room ${room.id}`);
    const clientSocket = await this.getClientSocket(user.ws_id);
    if (clientSocket) {
      await clientSocket.leave(room.id);
    }
  }

  doSendEventToServer(event: string, message: messageType | string) {
    this.server.emit(event, message);
  }

  doSendEventToRoom(
    destId: string | string[],
    event: string,
    message: messageType,
  ) {
    if (destId && destId.length) {
      this.server.to(destId).emit(event, message);
    }
  }
}
