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
import { myPtoOnlineGameDto, myPtoUserDto, sleep } from './utils/utils';
import {
  BallPosDto,
  BroadcastDto,
  GamePlayerDto,
  PowerUpDto,
  ScoreDto,
} from './dto/gameplay.dto';
import { Game } from './entities/game.entity';

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

  //------------------------- LIFECYCLE EVENTS -------------------------------//

  afterInit() {
    this.logger.debug('ws game 🎲  afterInit');
  }

  async handleConnection(client: Socket) {
    this.logger.debug('ws game 🎲  connect -> ', client.id);
    await this.wsConnectionService.doHandleConnection(client);
  }

  async handleDisconnect(client: Socket) {
    this.logger.debug('ws game 🎲  disconnected -> ', client.id);
    await this.wsConnectionService.doHandleDisconnect(client, this.server);
  }

  //---------------------- GAME SUBSCRIPTION EVENTS --------------------------//

  async joinGame(game_id: string, joining: boolean) {
    if (!joining) return { game_id: game_id, P1: null };
    this.logger.log('joinGame');

    const game = await this.gameService.findOne(game_id, {
      relations: ['players', 'players.user', 'players.user.local_photo'],
    });
    const ws_ids = [game.players[0].user.game_ws, game.players[1].user.game_ws];
    this.server
      .to(ws_ids[0])
      .emit('newPlayerJoined', myPtoUserDto(game.players[1].user));
    this.wsGameService.startGame(ws_ids, game.id, this.server);
    return { game_id: game_id, P1: myPtoUserDto(game.players[0].user) };
  }

  async gameInvitation(challenger: User, opponent: User) {
    this.server
      .to(opponent.game_ws)
      .emit('gameInvitation', myPtoUserDto(challenger), challenger.game_ws);
  }

  @UseFilters(WsErrorFilter)
  @SubscribeMessage('gameInvitResponse')
  async gameInvitResponse(
    @ConnectedSocket() client: Socket,
    @MessageBody() reply: { response: string; to: string },
  ) {
    this.logger.log('gameInvitResponse: ', reply);
    const [challenger, opponent] = await this.wsGameService.getUserFromParam(
      [{ game_ws: reply.to }, { game_ws: client.id }],
      null,
    );

    if (!opponent || !challenger) {
      this.wsGameService.cancelPanicGame([challenger, opponent]);
      throw new WsException('Wow shit');
    }
    if (!challenger.is_in_game) return 1;

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
    return 0;
  }

  @SubscribeMessage('setMap')
  async setMap(
    @ConnectedSocket() client: Socket,
    @MessageBody('room') room: string,
    @MessageBody('map') map: string,
  ) {
    this.logger.log(`setMap: ${map}`);
    let gameData: Partial<Game>;
    const [game] = await this.gameService.findGameWithAnyParam(
      [{ id: room }],
      null,
    );
    if (game.watch === null) gameData = { map: map, watch: randomUUID() };
    else gameData = { map: map, watch: game.watch };
    await this.gameService.updateGame(room, gameData);

    client.to(room).emit('getGameData', gameData);

    ///// TEST // TODO: delete test below
    console.log(`client id: ${client.id}`);
    console.log(
      'countdown finished, game: ',
      await this.gameService.findOne(room, null),
    );
    return gameData.watch;
  }

  @SubscribeMessage('watchGame')
  async watchGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    const [game] = await this.gameService.findGameWithAnyParam(
      [{ watch: room }],
      { relations: ['players', 'players.user', 'players.user.local_photo'] },
    );
    if (!game || !game.watch) return null;
    client.join(room);
    return myPtoOnlineGameDto(game);
  }

  @SubscribeMessage('leaveWatchGame')
  leaveWatchGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.leave(room);
  }

  //------------------------- END GAME ---------------------------------------//

  @SubscribeMessage('giveUpGame')
  async giveUpGame(
    @ConnectedSocket() client: Socket,
    @MessageBody('bcast') bcast: BroadcastDto,
  ) {
    this.logger.log(
      `giveUpGame. room: ${bcast.room},
      watchers: ${bcast.watchers}, op: ${bcast.op}`,
    );
    const users = await this.wsGameService.getUserFromParam(
      [{ game_ws: client.id }, { game_ws: bcast.op }],
      { relations: ['players'] },
    );
    client.to(bcast.op).emit('gaveUp', myPtoUserDto(users[0]));
    try {
      const game = await this.gameService.findOne(bcast.room, {
        relations: ['players', 'players.user'],
      });
      await this.wsGameService.handleGameEnd(
        client.id,
        game,
        this.server,
        users[0],
      );
    } catch (e) {
      this.wsGameService.updatePlayerStatus(users[0], { is_in_game: false });
      if (users.length > 1)
        this.wsGameService.updatePlayerStatus(users[1], { is_in_game: false });
      console.log('catch e.status: ', e.status);
      console.log('catch e.message: ', e.message);
    }
  }

  @SubscribeMessage('endGame')
  async endGame(
    @MessageBody('bcast') bcast: BroadcastDto,
    @MessageBody('score') score: ScoreDto,
  ) {
    this.logger.log(`endGame `);
    console.log(bcast, score);

    const ret = await this.gameService.updateScores(bcast.room, score, {
      watch: null,
      updatedAt: Date.now(),
    });
    if (!ret) return;
    await this.wsGameService.updatePlayerStatus2(
      [ret.players[0].user.id, ret.players[1].user.id],
      { is_in_game: false },
    );
    this.server.socketsLeave([bcast.room, bcast.watchers]);
  }

  //------------------------- GAMEPLAY EVENTS --------------------------------//

  @SubscribeMessage('scoreUpdate')
  scoreUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody('bcast') bcast: BroadcastDto,
    @MessageBody('score') score: ScoreDto,
  ) {
    this.gameService.updateScores(bcast.room, score, {
      updatedAt: Date.now(),
    });
    client.to([bcast.room, bcast.watchers]).emit('scoreUpdate', score);
  }

  @SubscribeMessage('powerUpUpdate')
  powerUpUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody('bcast') bcast: BroadcastDto,
    @MessageBody('powerup') powerup: PowerUpDto,
  ) {
    client.to([bcast.room, bcast.watchers]).emit('powerUpUpdate', powerup);
  }

  @SubscribeMessage('ballPosUpdate')
  ballPosUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody('bcast') bcast: BroadcastDto,
    @MessageBody('ballpos') ballpos: BallPosDto,
  ) {
    client.to([bcast.room, bcast.watchers]).emit('ballPosUpdate', ballpos);
  }

  @SubscribeMessage('playerUpdate')
  playerUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody('bcast') bcast: BroadcastDto,
    @MessageBody('gamePlayer') gamePlayer: GamePlayerDto,
    @MessageBody('playerNb') playerNb: number,
  ) {
    client
      .to([bcast.room, bcast.watchers])
      .emit('playerUpdate', gamePlayer, playerNb);
  }
}
