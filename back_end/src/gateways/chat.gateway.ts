import {
  GatewayMetadata,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { ChatGatewayService } from './chatGateway.service';

const options: GatewayMetadata = {
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
};

@WebSocketGateway(options)
export class ChatGateway {
  constructor(private readonly chatGatewayService: ChatGatewayService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.server = server;
  }

  async handleConnection(client: Socket) {
    return this.chatGatewayService.handleConnection(client);
  }

  async handleDisconnect(client: Socket) {
    return this.chatGatewayService.handleDisconnect(client);
  }

  broadcastEvent(event: string, message: string){
    return this.chatGatewayService.broadcastEvent(this.server, event, message);
  }

  // @UsePipes(new ValidationPipe({
  //   whitelist: true
  // }))
  @SubscribeMessage('ingame')
  async updateIngane(client: Socket, data: string) {
    return await this.chatGatewayService.setUserIngame(client, data);
  }
}
