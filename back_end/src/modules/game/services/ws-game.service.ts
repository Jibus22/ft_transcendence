import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UsersService } from 'src/modules/users/service-users/users.service';
import { Socket } from 'socket.io';
import { UpdateUserDto } from 'src/modules/users/dtos/update-users.dto';

@Injectable()
export class WsGameService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly usersService: UsersService,
  ) {}

  private async updateUser(client: Socket, userData: UpdateUserDto) {
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

  private doHandleConnectionFailure(client: Socket, errorMessage: string) {
    if (process.env.NODE_ENV === 'dev') {
      console.log(
        `handleConnectionFAILURE: client ${client.id} disconnected !🛑  -> `,
        errorMessage,
      );
    }
    client._error({ message: errorMessage });
    client.disconnect();
  }

  private async getUserIdFromToken(token: string) {
    if (token) {
      return await this.cacheManager.get<string>(token);
    }
  }

  async doHandleConnection(client: Socket): Promise<void> {
    const { key: token } = client.handshake.auth;
    const userId = await this.getUserIdFromToken(token).catch((error) => {
      this.doHandleConnectionFailure(client, error.message);
    });

    if (!userId) {
      return this.doHandleConnectionFailure(client, 'invalid token');
    }
    if (process.env.NODE_ENV === 'dev') {
      console.log(`handleConnection: ${client.id} | token ${token}`);
    }

    await this.usersService
      .update(userId, {
        game_ws: client.id,
      })
      .catch((error) => {
        this.doHandleConnectionFailure(client, error.message);
      });

    if (process.env.NODE_ENV === 'dev') {
      console.log(`handleConnection: Client connected ! ✅`);
    }
  }

  async doHandleDisconnect(client: Socket) {
    if (process.env.NODE_ENV === 'dev') {
      console.log(`Client disconnected: ${client.id}`);
    }
    await this.updateUser(client, {
      game_ws: null,
      is_in_game: false,
    });
  }
}
