import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { User } from '../modules/users/entities/users.entity';
import { UsersService } from '../modules/users/service-users/users.service';
import { ChatGateway } from './chat.gateway';

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
    return await this.cacheManager.get<string>(token);
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
    const userId = await this.getUserIdFromToken(token);

    if (!userId) {
      client._error({ message: 'wrong token' });
      return client.disconnect();
    }
    return await this.usersService
      .update(userId, {
        ws_id: client.id,
      })
      .catch((err) => {
        console.log(err.message);
        client._error({ message: err.message });
        return client.disconnect();
      });
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    await this.updateUser(client, {
      ws_id: null,
      is_in_game: false,
    });
  }

  /*
	===================================================================
	-------------------------------------------------------------------
				EVENTS SENDER
	-------------------------------------------------------------------
	===================================================================
	*/

  broadcastEvent(server: Server, event: string, message: string) {
    console.log(typeof server);
    console.log(event, message);
  }

  /*
	===================================================================
	-------------------------------------------------------------------
				EVENTS LISTENNERS
	-------------------------------------------------------------------
	===================================================================
	*/

  async setUserIngame(client: Socket, data: string) {
    if (data === 'in') {
      console.log(true);
      await this.updateUser(client, {
        is_in_game: true,
      }).catch((err) => console.log(err));
    } else if (data === 'out') {
      console.log(false);
      await this.updateUser(client, {
        is_in_game: false,
      }).catch((err) => console.log(err));
    }
  }
}
