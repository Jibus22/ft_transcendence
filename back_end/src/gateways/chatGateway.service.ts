import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { Room } from '../modules/chat/entities/room.entity';
import { User } from '../modules/users/entities/users.entity';
import { UsersService } from '../modules/users/service-users/users.service';

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
    await this.usersService
      .findRoomParticipations(user.id)
      .then((rooms) => {
        if (rooms.length) {
          client.join(rooms.map((r) => r.id));
        }
      })
      .catch((err) => console.log(err));
  }

  private async updateUser(client: Socket, userData: Partial<User>) {
    const user = await this.usersService
      .find({ ws_id: client.id })
      .catch((err) => {
        console.log(err.message);
        client._error({ message: err.message });
        return client.disconnect();
      });

    if (user[0]) {
      return await this.usersService
        .update(user[0].id, userData)
        .catch((err) => {
          console.log(err.message);
          client._error({ message: err.message });
          return client.disconnect();
        });
    }
  }

  private async getUserIdFromToken(token: string) {
    if (token) {
      return await this.cacheManager.get<string>(token);
    }
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
    const userId = await this.getUserIdFromToken(token);
    console.log(`handleConnection: ${client.id} | token ${token}`);

    if (!userId) {
      console.log(`handleConnection: TOKEN KO!  Client disconnected !🛑 `);
      client._error({ message: 'wrong token' });
      return client.disconnect();
    }
    await this.usersService
      .update(userId, {
        ws_id: client.id,
      })
      .catch((err) => {
        console.log(err.message);
        client._error({ message: err.message });
        console.log(`handleConnection: Client disconnected !🛑 `);
        return client.disconnect();
      })
      .then((user: User) => {
        console.log(`handleConnection: Client connected ! ✅`);
        this.joinRoomsAtConnection(client, user);
      });
  }

  async handleDisconnect(server: Server, client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    await this.updateUser(client, {
      ws_id: null,
      is_in_game: false,
    }).catch((err) => console.log(err));
  }

  /*
	===================================================================
	-------------------------------------------------------------------
				EVENTS SENDER
	-------------------------------------------------------------------
	===================================================================
	*/

  broadcastEventToServer(server: Server, event: string, message: string) {
    server.emit(event, message);
  }

  broadcastEventToRoom(
    server: Server,
    room: Room,
    event: string,
    message: string,
  ) {
    server.emit(event, message);
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
      }).catch((err) => console.log(err));
    } else if (data.value === 'out') {
      console.log(false);
      await this.updateUser(client, {
        is_in_game: false,
      }).catch((err) => console.log(err));
    }
  }
}
