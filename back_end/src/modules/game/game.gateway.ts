import { Server, Socket } from 'socket.io';
import {
  GatewayMetadata,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { User } from '../users/entities/users.entity';
import { plainToClass } from 'class-transformer';
import { UserDto } from '../users/dtos/user.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { randomUUID } from 'crypto';

const options_game: GatewayMetadata = {
  namespace: 'game',
  cors: {
    origin: ['http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
};

@WebSocketGateway(options_game)
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server: Server;

  constructor(private readonly gameService: GameService) {}

  afterInit() {
    console.debug('ws game 🎲  afterInit -> ', this.server);
  }

  async handleConnection(client: Socket) {
    console.debug('ws game 🎲  connect -> ', client.id);
  }

  async handleDisconnect(client: Socket) {
    console.debug('ws game 🎲  disconnected -> ', client.id);
  }

  gameInvitation(challenger: User, opponent: User) {
    this.server
      .to(opponent.game_ws)
      .emit('gameInvitation', plainToClass(UserDto, challenger));
  }

  @SubscribeMessage('createGame')
  async createGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() createGameDto: CreateGameDto,
  ) {
    const game_uuid = await this.gameService.newGame(createGameDto);
    const ws_op = await this.gameService.getWs(createGameDto.loginP2);
    const socket_op = await this.server.in(ws_op).fetchSockets();
    client.join(game_uuid);
    socket_op.join(game_uuid);
    this.server.in(game_uuid).emit('getRoom', game_uuid);
    this.countDown(client, game_uuid);
  }

  @SubscribeMessage('acceptGame')
  async acceptGame(@MessageBody() createGameDto: CreateGameDto) {
    const ws_ch = await this.gameService.getWsNPatchStatus(createGameDto, {
      is_in_game: true,
    });
    this.server.to(ws_ch).emit('gameAccepted');
  }

  // Here createGameDto.loginP2 should be null
  @SubscribeMessage('denyGame')
  async denyGame(@MessageBody() createGameDto: CreateGameDto) {
    const ws_ch = await this.gameService.getWsNPatchStatus(createGameDto, {
      is_in_game: false,
    });
    this.server.to(ws_ch).emit('gameDenied');
  }

  async countDown(@ConnectedSocket() client: Socket, room: string) {
    let count = 10;
    const uuid = randomUUID();
    setInterval(() => {
      this.server.in(room).emit('countDown', count);
      count--;
      if (!count) {
        client.emit('setMap', (map: string) => {
          this.gameService.updateGame(room, { map: map, watch: uuid });
        });
        this.server.in(room).emit('startGame', count);
        clearInterval();
      }
    }, 1000);
  }
}
