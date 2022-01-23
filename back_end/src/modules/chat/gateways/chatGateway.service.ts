import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import { User } from '../../users/entities/users.entity';
import { UsersService } from '../../users/service-users/users.service';
import { Room } from '../entities/room.entity';
import { ChatGateway, messageType } from './chat.gateway';

@Injectable()
export class ChatGatewayService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private chatGateway: ChatGateway,
    private usersService: UsersService,
  ) {}

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

  private async updateUser(client: Socket, userData: Partial<User>) {
    await this.usersService
      .find({ ws_id: client.id })
      .then(async (users) => {
        if (users[0]) {
          await this.usersService.update(users[0].id, userData);
        }
      })
      .catch((error) => {
        console.log(error.message);
        client._error({ message: error.message });
        return client.disconnect();
      });
  }

  private async getUserIdFromToken(token: string) {
    if (token) {
      return await this.cacheManager.get<string>(token);
    }
  }

  private handleConnectionFailure(client: Socket, errorMessage: string) {
    if (process.env.NODE_ENV === 'dev') {
      console.log(
        `handleConnection: client ${client.id} disconnected !🛑  -> `,
        errorMessage,
      );
    }
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

  async handleConnection(client: Socket) {
    const { key: token } = client.handshake.auth;
    const userId = await this.getUserIdFromToken(token).catch((error) => {
      this.handleConnectionFailure(client, error.message);
    });

    if (!userId) {
      return this.handleConnectionFailure(client, 'invalid token');
    }
    if (process.env.NODE_ENV === 'dev') {
      console.log(`handleConnection: ${client.id} | token ${token}`);
    }

    await this.usersService
      .update(userId, {
        ws_id: client.id,
      })
      .catch((error) => {
        this.handleConnectionFailure(client, error.message);
      })
      .then(async (user: User) => {
        if (process.env.NODE_ENV === 'dev') {
          console.log(`handleConnection: Client connected ! ✅`);
        }

        this.chatGateway.storage.set(client.id, client);
        return await this.joinRoomsAtConnection(client, user);
      })
      .catch((error) => {
        this.handleConnectionFailure(client, error.message);
      });
  }

  async handleDisconnect(client: Socket) {
    if (process.env.NODE_ENV === 'dev') {
      console.log(`Client disconnected: ${client.id}`);
    }
    this.chatGateway.storage.delete(client.id);
    await this.updateUser(client, {
      ws_id: null,
      is_in_game: false,
    });
  }

  async makeClientJoinRoom(user: User, room: Room) {
    if (process.env.NODE_ENV === 'dev') {
      console.log(`Add client ${user?.login} to room ${room.id}`);
    }
    const clientSocket = this.chatGateway.storage.get(user.ws_id);
    if (clientSocket) {
      await clientSocket.join(room.id);
    }
  }

  async makeClientLeaveRoom(user: User, room: Room) {
    if (process.env.NODE_ENV === 'dev') {
      console.log(`Remove client ${user?.login} to room ${room.id}`);
    }
    const clientSocket = this.chatGateway.storage.get(user.ws_id);
    if (clientSocket) {
      await clientSocket.leave(room.id);
    }
  }

  /*
	===================================================================
	-------------------------------------------------------------------
				EVENTS EMITERS
	-------------------------------------------------------------------
	===================================================================
	*/

  sendEventToServer(event: string, message: messageType) {
    if (process.env.NODE_ENV === 'dev') {
      console.log('Emit event to SERVER: ', event);
    }
    return this.doSendEventToServer(this.chatGateway.server, event, message);
  }

  sendEventToRoom(room: Room | Room[], event: string, message: messageType) {
    if (process.env.NODE_ENV === 'dev') {
      console.log('Emit event to ROOM: ', event);
    }
    const dest = Array.isArray(room) ? room.map((r) => r.id) : room.id;
    return this.doSendEventToRoom(
      this.chatGateway.server,
      dest,
      event,
      message,
    );
  }

  sendEventToClient(user: User, event: string, message: messageType) {
    if (process.env.NODE_ENV === 'dev') {
      console.log('Emit event to CLIENT: ', event);
    }
    return this.doSendEventToRoom(
      this.chatGateway.server,
      user.ws_id,
      event,
      message,
    );
  }

  doSendEventToServer(
    server: Server,
    event: string,
    message: messageType | string,
  ) {
    server.emit(event, message);
  }

  doSendEventToRoom(
    server: Server,
    destId: string | string[],
    event: string,
    message: messageType,
  ) {
    if (destId && destId.length) {
      server.to(destId).emit(event, message);
    }
  }

  /*
	===================================================================
	-------------------------------------------------------------------
				EVENTS LISTENNERS
	-------------------------------------------------------------------
	===================================================================
	*/

  async setUserIngame(client: Socket, data: { value: 'in' | 'out' }) {
    if (data.value === 'in') {
      console.log(true);
      await this.updateUser(client, {
        is_in_game: true,
      }).catch((error) => console.log(error));
    } else if (data.value === 'out') {
      console.log(false);
      await this.updateUser(client, {
        is_in_game: false,
      }).catch((error) => console.log(error));
    }
  }
}
