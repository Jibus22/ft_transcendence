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
  WsException,
} from '@nestjs/websockets';
import { User } from '../users/entities/users.entity';
import { plainToClass } from 'class-transformer';
import { UserDto } from '../users/dtos/user.dto';
import { WsGameService } from './services/ws-game.service';
import { Logger, UseFilters } from '@nestjs/common';
import { WsErrorFilter } from './filters/ws-error.filter';
import { WsConnectionService } from './services/ws-connection.service';

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

// @UseFilters(WsErrorFilter)
@WebSocketGateway(options_game)
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server: Server;

  constructor(
    private readonly wsGameService: WsGameService,
    private readonly wsConnectionService: WsConnectionService,
  ) {}

  private readonly logger = new Logger('GameGateway');

  afterInit() {
    console.debug('ws game 🎲  afterInit');
  }

  async handleConnection(client: Socket) {
    console.debug('ws game 🎲  connect -> ', client.id);
    await this.wsConnectionService.doHandleConnection(client);
  }

  async handleDisconnect(client: Socket) {
    console.debug('ws game 🎲  disconnected -> ', client.id);
    await this.wsConnectionService.doHandleDisconnect(client);
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

  @UseFilters(WsErrorFilter)
  @SubscribeMessage('gameInvitResponse')
  async gameInvitResponse(
    @ConnectedSocket() client: Socket,
    @MessageBody() reply: { response: string; to: string },
  ) {
    this.logger.log('gameInvitResponse: ', reply);
    const [challenger, opponent] = await this.wsGameService.getUserFromParam([
      { game_ws: reply.to },
      { game_ws: client.id },
    ]);

    if (!opponent || !challenger) {
      this.wsGameService.cancelPanicGame([challenger, opponent]);
      throw new WsException('Wow shit');
    }

    const challenger_sock = await this.server
      .in(challenger.game_ws)
      .fetchSockets();

    if (reply.response === 'OK') {
      this.logger.log(`gameInvitation accepted: ${reply.response}`);
      this.wsGameService.updatePlayerStatus(opponent, { is_in_game: true });
      challenger_sock[0].emit('gameAccepted', plainToClass(UserDto, opponent));
      this.wsGameService
        .createGame(
          challenger,
          opponent,
          challenger_sock[0],
          client,
          this.server,
        )
        .catch((e) => {
          this.logger.log(`------ ERROR ------ ${e.error}`);
          this.wsGameService.cancelPanicGame([challenger, opponent]);
          client.emit('myerror', e.error);
        });
    } else {
      this.logger.log(`gameInvitation denied: ${reply.response}`);
      this.wsGameService.updatePlayerStatus(challenger, {
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
