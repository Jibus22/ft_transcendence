import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import { User } from '../../users/entities/users.entity';
import { UsersService } from '../../users/service-users/users.service';
import { Room } from '../entities/room.entity';
import { messageType } from './chat.gateway';

@Injectable()
export class ChatGatewayService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const user = await this.usersService
      .find({ ws_id: client.id })
      .catch((error) => {
        console.log(error.message);
        client._error({ message: error.message });
        return client.disconnect();
      });

    if (user[0]) {
      return await this.usersService
        .update(user[0].id, userData)
        .catch((error) => {
          console.log(error.message);
          client._error({ message: error.message });
          return client.disconnect();
        });
    }
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

  async handleConnection(server: Server, client: Socket) {
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
        return await this.joinRoomsAtConnection(client, user);
      })
      .catch((error) => {
        this.handleConnectionFailure(client, error.message);
      });
  }

  async handleDisconnect(server: Server, client: Socket) {
    if (process.env.NODE_ENV === 'dev') {
      console.log(`Client disconnected: ${client.id}`);
    }
    await this.updateUser(client, {
      ws_id: null,
      is_in_game: false,
    });
  }

  makeClientJoinRoom(clientSocket: Socket, room: Room) {
    return clientSocket.join(room.id);
  }

  makeClientLeaveRoom(clientSocket: Socket, room: Room) {
    return clientSocket.leave(room.id);
  }

  /*
	===================================================================
	-------------------------------------------------------------------
				EVENTS EMITERS
	-------------------------------------------------------------------
	===================================================================
	*/

  sendEventToServer(server: Server, event: string, message: messageType) {
    server.emit(event, message);
  }

  sendEventToRoom(
    server: Server,
    destId: string,
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
