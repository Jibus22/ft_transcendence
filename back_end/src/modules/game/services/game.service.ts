import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateGameDto } from '../dto/update-game.dto';
import { Game } from '../entities/game.entity';
import { Player } from '../entities/player.entity';
import { getRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users/service-users/users.service';
import {
  RelationType,
  RelationsService,
} from '../../users/service-relations/relations.service';
import { User } from '../../users/entities/users.entity';
import { UserDto } from '../../users/dtos/user.dto';
import { plainToClass } from 'class-transformer';
import { IPlayerError, PlayerHttpError, PlayerWsError } from '../utils/error';
import { UpdatePlayerDto } from '../dto/update-player.dto';
import { ScoreDto } from '../dto/gameplay.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private game_repo: Repository<Game>,
    @InjectRepository(Player) private player_repo: Repository<Player>,
    private readonly usersService: UsersService,
    private readonly relationsService: RelationsService,
  ) {}

  private readonly logger = new Logger('GameService');

  private async checkErrors(
    [user, opponent]: User[],
    login_opponent: string,
    cbErr: IPlayerError,
    cb: (value: UserDto) => void,
  ) {
    [
      { user: user, login: user.login },
      { user: opponent, login: login_opponent },
    ].forEach(cbErr.errorUserNotFound);

    const usersDto = plainToClass(UserDto, [user, opponent]);
    cbErr.errorSamePlayer(usersDto);
    usersDto.forEach(cb);

    const blockerList = await this.relationsService.readAllRelations(
      opponent.id,
      RelationType.Block,
    );
    cbErr.isBlocker(blockerList, usersDto);

    [user, opponent].forEach(cbErr.isGameWs);
  }

  private async createGameTable(user1: User, user2: User) {
    const game = this.game_repo.create();
    await this.game_repo.save(game);
    const player1 = this.player_repo.create({ user: user1, game: game });
    const player2 = this.player_repo.create({ user: user2, game: game });
    await this.player_repo.save([player1, player2]);
    game.players = [player1, player2];
    await this.game_repo.save(game);
    return game.id;
  }

  async newGame(challenger: User, opponent: User): Promise<string> {
    this.logger.log('newGame');

    const err = new PlayerWsError();
    await this.checkErrors(
      [challenger, opponent],
      opponent.login,
      err,
      err.errorPlayerNotInGame,
    );
    return await this.createGameTable(challenger, opponent);
  }

  async gameInvitation(login_opponent: string, user: User): Promise<User> {
    const opponent = await this.usersService.findLogin(login_opponent);
    const err = new PlayerHttpError();
    await this.checkErrors(
      [user, opponent],
      login_opponent,
      err,
      err.errorPlayerNotOnline,
    );
    await this.usersService.update(user.id, { is_in_game: true }); //TODO: uncomment
    return opponent;
  }

  ////////////////

  async joinGame(userId: string) {
    let game: Game;
    let player1: Player;
    let waiting_game: { gameId: string; total: string | number };
    const user = await this.usersService.findOne(userId);
    const query_games: { gameId: string; total: string | number }[] =
      await getRepository(Player)
        .createQueryBuilder('player')
        .select('player.game')
        .groupBy('player.game')
        .addSelect('COUNT(player.game)', 'total')
        .where('player.game is not null')
        .getRawMany();

    if (process.env.NODE_ENV === 'production') {
      [waiting_game] = query_games.filter((elem) => {
        if (elem.total === '1') return elem;
      });
    } else {
      [waiting_game] = query_games.filter((elem) => {
        if (elem.total === 1) return elem;
      });
    }

    if (!waiting_game) {
      game = this.game_repo.create();
      game = await this.game_repo.save(game);
    } else game = await this.game_repo.findOne(waiting_game.gameId);
    player1 = this.player_repo.create({ user: user, game: game });
    player1 = await this.player_repo.save(player1);
    this.game_repo
      .createQueryBuilder()
      .relation(Game, 'players')
      .of(game)
      .add(player1);

    await this.usersService.updateUser(user, { is_in_game: true });
    return { game_id: game.id, joining: !!waiting_game };
  }

  ////////////////

  async findAll() {
    const game = await this.game_repo.find();
    if (!game) {
      throw new NotFoundException('game not found');
    }
    return game;
  }

  //returns a specific game according to its uuid
  async findOne(uuid: string, relations: { relations: string[] }) {
    let game: Game;
    if (!relations) game = await this.game_repo.findOne(uuid);
    else game = await this.game_repo.findOne(uuid, relations);
    if (!game) {
      throw new NotFoundException('game not found');
    }
    return game;
  }

  async findGameWithAnyParam(
    param: Partial<Game>[],
    relations: { relations: string[] },
  ) {
    let games: Game[] = [];
    for (let elem of param) {
      let game: Game;
      if (!relations) game = await this.game_repo.findOne(elem);
      else game = await this.game_repo.findOne(elem, relations);
      if (game) games.push(game);
    }
    return games;
  }

  //update a game targeted by its uuid
  async updateGame(uuid: string, patchedGame: Partial<UpdateGameDto>) {
    await this.game_repo.update(uuid, patchedGame);
    return await this.findOne(uuid, null);
  }

  //update a player
  async updatePlayers(objs: { id: string; patch: Partial<UpdatePlayerDto> }[]) {
    for (let elem of objs) {
      await this.player_repo.update(elem.id, elem.patch);
    }
  }

  async updateScores(
    game_id: string,
    score: ScoreDto,
    patchedGame: Partial<UpdateGameDto>,
  ) {
    const ret = await this.findOne(game_id, {
      relations: ['players', 'players.user'],
    });
    if (!ret) return ret;
    await this.updatePlayers([
      { id: ret.players[0].id, patch: { score: score.score1 } },
      { id: ret.players[1].id, patch: { score: score.score2 } },
    ]);
    if (patchedGame) this.updateGame(game_id, patchedGame);
    return ret;
  }

  async remove(uuid: string) {
    const game = await this.game_repo.findOne(uuid);
    if (!game) throw new NotFoundException('game not found');

    return await this.game_repo.remove(game);
  }

  async history() {
    const games = await this.game_repo.find({
      relations: ['players', 'players.user', 'players.user.local_photo'],
    });
    return games;
  }

  async leaderboard() {
    const allUsers = await this.usersService.getAllPlayersUsers();
    if (!allUsers) throw new NotFoundException(`No users found in database`);
    return allUsers;
  }
}
