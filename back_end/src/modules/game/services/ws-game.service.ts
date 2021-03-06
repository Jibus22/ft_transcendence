import { Injectable, Logger } from '@nestjs/common';
import { myPtoOnlineGameDto, myPtoUserDto, sleep } from '../utils/utils';
import { Server } from 'socket.io';
import { User } from '../../users/entities/users.entity';
import { UsersService } from '../../users/service-users/users.service';
import { GameService } from './game.service';
import { ScoreDto } from '../dto/gameplay.dto';
import { Game } from '../entities/game.entity';

@Injectable()
export class WsGameService {
  constructor(
    private readonly usersService: UsersService,
    private readonly gameService: GameService,
  ) {}

  private readonly logger = new Logger('WsGameService');

  private async countdown(server: Server, ch_id: string, room: string) {
    this.logger.log('countDown');

    for (let count = 5; count >= 0; count--) {
      server.to(room).emit('countDown', count);
      if (!count) {
        server.to(ch_id).emit('setMap', room);
        server.to(room).emit('startGame', room);
      }
      await sleep(1000);
    }
  }

  private async getOnlineGame(game_uuid: string) {
    const game = await this.gameService.findOne(game_uuid, {
      relations: ['players', 'players.user', 'players.user.local_photo'],
    });
    return myPtoOnlineGameDto(game);
  }

  async startGame([ch_id, op_id]: string[], game_uuid: string, server: Server) {
    this.logger.log('startGame');
    server.in([ch_id, op_id]).socketsJoin(game_uuid);
    this.countdown(server, ch_id, game_uuid).then(async () => {
      const onlineGame = await this.getOnlineGame(game_uuid);
      server.except(game_uuid).emit('newOnlineGame', onlineGame);
    });
  }

  async createGame(
    [challenger, opponent]: User[],
    [ch_id, op_id]: string[],
    server: Server,
  ) {
    this.logger.log('createGame');
    const game_uuid = await this.gameService.newGame(challenger, opponent);
    this.startGame([ch_id, op_id], game_uuid, server);
  }

  async updatePlayerStatus(player: User, patch: { is_in_game: boolean }) {
    await this.usersService.updateUser(player, patch);
  }

  async updatePlayerStatus2(
    player_id: string[],
    patch: { is_in_game: boolean },
  ) {
    for (let elem of player_id) await this.usersService.update(elem, patch);
  }

  async getUserFromParam(
    param: Partial<User>[],
    relations: { relations: string[] },
  ): Promise<User[]> {
    return await this.usersService.findOneWithAnyParam(param, relations);
  }

  //------------------------- END GAME ---------------------------------------//

  private async updateEndGame(game: Game, score: ScoreDto) {
    this.logger.log(`updateEndGame`);
    await this.gameService.updateScores(game.id, score, {
      watch: null,
      updatedAt: Date.now(),
    });
  }

  // If only 1 player in game, delete game
  // set score of player who didn't gave up to 10
  // update game table so it has a end date and watch null
  // update players status is_in_game: false
  // notify the other of giving up
  // leave rooms
  async handleGameEnd(
    client_id: string,
    game: Game,
    server: Server,
    user: User,
  ) {
    this.logger.log(`handleGameEnd: ${user.login} - ${game.id}`);
    let score = new ScoreDto();
    if (game.players.length < 2) {
      this.gameService.remove(game.id);
      await this.updatePlayerStatus2([game.players[0].user.id], {
        is_in_game: false,
      });
      return;
    }
    score.score1 = game.players[0].score;
    score.score2 = game.players[1].score;
    if (game.players[0].user.id === user.id) score.score2 = 10;
    else score.score1 = 10;
    await this.updateEndGame(game, score);
    await this.updatePlayerStatus2(
      [game.players[0].user.id, game.players[1].user.id],
      { is_in_game: false },
    );
    server
      .to([game.id, game.watch])
      .except(client_id)
      .emit('playerGiveUp', myPtoUserDto(user));
    server.socketsLeave([game.id, game.watch]);
  }

  async cancelPanicGame(users: User[]) {
    for (let elem of users)
      if (elem) this.updatePlayerStatus(elem, { is_in_game: false });
  }
}
