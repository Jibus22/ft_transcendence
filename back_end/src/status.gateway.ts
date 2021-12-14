import { CACHE_MANAGER, Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { Socket } from 'socket.io';
import { UsersService } from './module-users/service-users/users.service';


const options = {
  cors: {
    origin: ['http://localhost:3001', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
};

@WebSocketGateway(options)
export class StatusGateway {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private usersService: UsersService
  ) {}

  @WebSocketServer()
  server;

  async getUserIdFromToken(token: string) {
    return await this.cacheManager.get<string>(token)
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const {key: token} = client.handshake.auth;
    const userId = await this.getUserIdFromToken(token);

    if (!userId) {
      client._error({message: 'wrong token'});
      return client.disconnect();
    }
    return await this.usersService.update(userId, {
      ws_id: client.id,
    });
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const user = await this.usersService.find({ws_id: client.id});

    if (user[0]) {
      await this.usersService.update(user[0].id, {
        ws_id: null,
      });
    }
  }

  // @SubscribeMessage('online')
  // // upateOnline(@MessageBody() message: string): void {
  // upateOnline(@ConnectedSocket() client): void {
  //   console.log(client.handshake.user);
  //   console.log(client.id);
    // if (!user) {
    //   console.log('No user logged');
    //   return;
    // }
    // console.log('Online:', message);
  // }

  @SubscribeMessage('ingame')
  upateIngame(@MessageBody() message: string): void {
    console.log('Ingame:', message);
  }
}
