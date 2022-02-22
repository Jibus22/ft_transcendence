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
import { WsGameService } from './services/ws-game.service';
import { Logger, UseFilters } from '@nestjs/common';
import { WsConnectionService } from './services/ws-connection.service';
import { WsErrorFilter } from './filters/ws-error.filter';
import { randomUUID } from 'crypto';
import { GameService } from './services/game.service';
import { myPtoUserDto } from './utils/utils';

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
    private readonly gameService: GameService,
    private readonly wsGameService: WsGameService,
    private readonly wsConnectionService: WsConnectionService,
  ) {}

  private readonly logger = new Logger('GameGateway');

  afterInit() {
    this.logger.debug('ws game 🎲  afterInit');
  }

  async handleConnection(client: Socket) {
    this.logger.debug('ws game 🎲  connect -> ', client.id);
    await this.wsConnectionService.doHandleConnection(client);
  }

  async handleDisconnect(client: Socket) {
    this.logger.debug('ws game 🎲  disconnected -> ', client.id);
    await this.wsConnectionService.doHandleDisconnect(client);
  }

  async joinGame(game_id: string, joining: boolean) {
    this.logger.log('joinGame');
    if (!joining) return null;

    const game = await this.gameService.findOne(game_id, {
      relations: ['players', 'players.user'],
    });
    this.logger.log(`game_id: ${game.id}  -- game.players:`);
    this.logger.log(game.players);
    const ws_ids = [game.players[0].user.game_ws, game.players[1].user.game_ws];
    this.server
      .to(ws_ids[0])
      .emit('newPlayerJoined', myPtoUserDto(game.players[1].user));
    this.wsGameService.startGame(ws_ids, game.id, this.server);
    return myPtoUserDto(game.players[0].user);
  }

  async gameInvitation(challenger: User, opponent: User) {
    const opponent_sock = await this.server.in(opponent.game_ws).fetchSockets();
    const challenger_sock = await this.server
      .in(challenger.game_ws)
      .fetchSockets();

    if (!opponent_sock || !challenger_sock) return;

    opponent_sock[0].emit(
      'gameInvitation',
      myPtoUserDto(challenger),
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

    if (reply.response === 'OK') {
      this.logger.log(`gameInvitation accepted: ${reply.response}`);
      this.wsGameService.updatePlayerStatus(opponent, { is_in_game: true });
      this.server.to(reply.to).emit('gameAccepted', myPtoUserDto(opponent));
      this.wsGameService
        .createGame([challenger, opponent], [reply.to, client.id], this.server)
        .catch((e) => {
          this.logger.log(`--- ERROR --- ${e.error}`);
          this.wsGameService.cancelPanicGame([challenger, opponent]);
          client.emit('myerror', e.error);
        });
    } else {
      this.logger.log(`gameInvitation denied: ${reply.response}`);
      this.wsGameService.updatePlayerStatus(challenger, {
        is_in_game: false,
      });
      this.server.to(reply.to).emit('gameDenied', myPtoUserDto(opponent));
    }
  }

  @SubscribeMessage('setMap')
  async setMap(
    @ConnectedSocket() client: Socket,
    @MessageBody() obj: { room: string; gamemap: string },
  ) {
    await this.gameService.updateGame(obj.room, {
      map: obj.gamemap,
      watch: randomUUID(),
    });

    ///// TEST // TODO: delete test below
    console.log(`client id: ${client.id}`);
    console.log(
      'countdown finished, game: ',
      await this.gameService.findOne(obj.room, null),
    );
  }

  //Implémentation à voir: est ce que c'est un event envoyé depuis un des joueurs
  //ou bien est-ce une methode a appeler differemment ? Genre qd l'update d'un
  //game atteint un score de 10 ?
  @SubscribeMessage('gameFinished')
  async gameFinished(@MessageBody() room: string) {
    this.server.of('game').except(room).emit('gameFinished', room);
    // const watch = this.wsGameService.getWatchId(room);
    // this.server.socketsLeave([room, watch]);//TODO uncomment
  }

  @SubscribeMessage('watchGame')
  async watchGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.join(room);
  }

  @SubscribeMessage('leaveWatchGame')
  async leaveWatchGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.leave(room);
  }
}
