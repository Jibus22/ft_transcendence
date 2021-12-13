import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UsersService } from './module-users/service-users/users.service';
import { Server, Socket } from 'socket.io';
import { User } from './module-users/entities/users.entity';

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
    private usersService: UsersService
  ) {}

  @WebSocketServer()
  server;

  handleConnection(client: Socket, ...args: any[]) {
    const key = client.handshake.auth;
    if (!key) {
      console.log(client.handshake);
      client.disconnect();
    }
    console.log(key);
    console.log(client.handshake);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('online')
  // upateOnline(@MessageBody() message: string): void {
  upateOnline(@ConnectedSocket() client, data): void {
    console.log(client.handshake.user);
    console.log(client.id);
    // if (!user) {
    //   console.log('No user logged');
    //   return;
    // }
    // console.log('Online:', message);
  }

  @SubscribeMessage('ingame')
  upateIngame(@MessageBody() message: string): void {
    console.log('Ingame:', message);
  }
}
