import { CACHE_MANAGER, Inject } from '@nestjs/common';
import {
  GatewayMetadata,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { Socket } from 'socket.io';
import { User } from '../modules/users/entities/users.entity';
import { UsersService } from '../modules/users/service-users/users.service';

const options: GatewayMetadata = {
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:3001', 'http://127.0.0.1:5500'], //TODO remove 127... for debug
    methods: ['GET', 'POST'],
    credentials: true,
  },
};

@WebSocketGateway(options)
export class ChatGateway {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private usersService: UsersService,
  ) {}

  @WebSocketServer()
  server;

  async updateUser(client: Socket, userData: Partial<User>) {
    const user = await this.usersService.find({ ws_id: client.id });

    if (user[0]) {
      return await this.usersService.update(user[0].id, userData);
    }
  }

  async getUserIdFromToken(token: string) {
    return await this.cacheManager.get<string>(token);
  }

  async handleConnection(client: Socket) {
    const { key: token } = client.handshake.auth;
    const userId = await this.getUserIdFromToken(token);

    if (!userId) {
      client._error({ message: 'wrong token' });
      return client.disconnect();
    }
    return await this.usersService.update(userId, {
      ws_id: client.id,
    });
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    await this.updateUser(client, {
      ws_id: null,
      is_in_game: false,
    });
  }

  // @UsePipes(new ValidationPipe({
  //   whitelist: true
  // }))
  @SubscribeMessage('ingame')
  async upateIngame(client: Socket, data: string) {
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
