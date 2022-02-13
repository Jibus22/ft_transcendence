import { Server, Socket, RemoteSocket } from 'socket.io';
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
import { GameService } from './services/game.service';
import { User } from '../users/entities/users.entity';
import { plainToClass } from 'class-transformer';
import { UserDto } from '../users/dtos/user.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { randomUUID } from 'crypto';
import { WsGameService } from './services/ws-game.service';

const options_game: GatewayMetadata = {
  namespace: 'game',
  cors: {
    origin: [
      `http://${process.env.SERVER_IP}`,
      `http://${process.env.SERVER_IP}:${process.env.FRONT_PORT}`,
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
};

@WebSocketGateway(options_game)
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly wsGameService: WsGameService,
  ) {}

  afterInit() {
    console.debug('ws game 🎲  afterInit');
  }

  async handleConnection(client: Socket) {
    console.debug('ws game 🎲  connect -> ', client.id);
    await this.wsGameService.doHandleConnection(client);
  }

  async handleDisconnect(client: Socket) {
    console.debug('ws game 🎲  disconnected -> ', client.id);
    await this.wsGameService.doHandleDisconnect(client);
  }

  private async countDown(challenger_sock: any, room: string) {
    console.log('SERVER: countDown');
    const start = Date.now();
    let count = 10;

    setInterval(() => {
      this.server.to(room).emit('countDown', count);
      count--;
      if (!count) {
        challenger_sock.emit('setMap', (map: string) => {
          const timestamp = Date.now() - start;
          if (timestamp > 3000) return; //connection issue: do something;
          this.gameService.updateGame(room, { map: map, watch: randomUUID() });
        });
        this.server.to(room).emit('startGame', count);
        clearInterval();
      }
    }, 1000);
  }

  private async createGame(
    challenger: User,
    opponent: User,
    challenger_sock: any,
    opponent_sock: any,
  ) {
    console.log('SERVER: createGame');
    const game_uuid = await this.gameService.newGame(challenger, opponent);

    challenger_sock.join(game_uuid);
    opponent_sock.join(game_uuid);
    this.server.to(game_uuid).emit('getRoom', game_uuid);
    this.countDown(challenger_sock, game_uuid);
  }

  async gameInvitation(challenger: User, opponent: User) {
    const opponent_sock = await this.server.in(opponent.game_ws).fetchSockets();
    const challenger_sock = await this.server
      .in(challenger.game_ws)
      .fetchSockets();

    if (!opponent_sock || !challenger_sock) return;

    opponent_sock[0].emit(
      'gameInvitation',
      plainToClass(UserDto, challenger),
      challenger_sock[0].id,
    );
  }

  @SubscribeMessage('gameInvitResponse')
  async gameInvitResponse(
    @ConnectedSocket() client: Socket,
    @MessageBody() reply: { response: string; to: string },
  ) {
    console.log('SERVER: gameInvitResponse');
    const challenger = await this.gameService.getUserFromParam({
      game_ws: reply.to,
    });
    const opponent = await this.gameService.getUserFromParam({
      game_ws: client.id,
    });

    if (!opponent || !challenger) return;

    const challenger_sock = await this.server
      .in(challenger.game_ws)
      .fetchSockets();

    if (reply.response === 'OK') {
      console.log('SERVER: gameInvitation accepted');
      // this.gameService.updatePlayerStatus(opponent, { is_in_game: true });
      // TODO: uncomment the above line when finishing tests
      challenger_sock[0].emit('gameAccepted', plainToClass(UserDto, opponent));
      // this.createGame(challenger, opponent, challenger_sock, client);
    } else {
      console.log('SERVER: gameInvitation denied');
      this.gameService.updatePlayerStatus(challenger, {
        is_in_game: false,
      });
      challenger_sock[0].emit('gameDenied', plainToClass(UserDto, opponent));
    }
  }

  // const wait = (timeToDelay: number) =>
  //   new Promise((resolve) => setTimeout(resolve, timeToDelay));

  // Here createGameDto.loginP2 should be null
  // @SubscribeMessage('denyGame')
  // async denyGame(@MessageBody() createGameDto: CreateGameDto) {
  //   const ws_ch = await this.gameService.getWsNPatchStatus(createGameDto, {
  //     is_in_game: false,
  //   });
  //   this.server.to(ws_ch).emit('gameDenied');
  // }

  // async countDown(@ConnectedSocket() client: Socket, room: string) {
  //   let count = 10;
  //   const uuid = randomUUID();
  //   setInterval(() => {
  //     this.server.in(room).emit('countDown', count);
  //     count--;
  //     if (!count) {
  //       client.emit('setMap', (map: string) => {
  //         this.gameService.updateGame(room, { map: map, watch: uuid });
  //       });
  //       this.server.in(room).emit('startGame', count);
  //       clearInterval();
  //     }
  //   }, 1000);
  // }

  /// ---------------- TEST --------------------
  async serverToClient(id: string, data: string) {
    console.log('gateway: serverToClient');
    const client = await this.server.in(id).fetchSockets();
    if (!client) console.log('no client');
    else if (client.length > 1) console.log('strange: client > 1');
    else client[0].emit('serverToClient', data);
  }

  @SubscribeMessage('clientToServer')
  clientToServer(
    @ConnectedSocket() client: Socket,
    @MessageBody() voila: string,
  ) {
    console.log('clientToServer');
    console.log(`------test here------ ${voila} --- client.id: ${client.id}`);
  }
  /// ---------------- TEST END ----------------
}
