import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateGameDto } from '../dto/update-game.dto';
import { Game } from '../entities/game.entity';
import { Player } from '../entities/player.entity';
import { getConnection, Repository } from 'typeorm';
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
      // null,
    );
    return await this.createGameTable(challenger, opponent);
  }

  async gameInvitation(login_opponent: string, user: User): Promise<User> {
    const opponent = await this.usersService.findLogin(login_opponent);
    this.usersService.updateUser(user, { is_in_game: false }); //TODO: delete
    this.usersService.updateUser(opponent, { is_in_game: false }); //TODO: delete
    const err = new PlayerHttpError();
    await this.checkErrors(
      [user, opponent],
      login_opponent,
      err,
      err.errorPlayerNotOnline,
    );
    this.usersService.updateUser(user, { is_in_game: true }); //TODO: uncomment
    return opponent;
  }

  ////////////////

  async joinGame(user: User) {
    let game: Game;
    let waiting_game: { gameId: string; total: number } = await this.player_repo
      .createQueryBuilder('player')
      .select('player.game')
      .groupBy('player.game')
      .addSelect('COUNT(player.game)', 'total')
      .having('total = :tot', { tot: 1 })
      .where('player.game is not null')
      .getRawOne();

    if (!waiting_game) {
      game = this.game_repo.create();
      game = await this.game_repo.save(game);
    } else game = await this.game_repo.findOne(waiting_game.gameId);
    let player1 = this.player_repo.create({ user: user, game: game });
    player1 = await this.player_repo.save(player1);
    this.game_repo
      .createQueryBuilder()
      .relation(Game, 'players')
      .of(game)
      .add(player1);

    const game2 = await this.findOne(game.id, {
      relations: ['players', 'players.user'],
    });
    console.log(`game_id: ${game2.id}  -- game.players:`);
    console.log(game2.players);

    return {
      game_id: game.id,
      player: player1,
      joining: !!waiting_game,
    };
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

  //update a game targeted by its uuid
  async updateGame(uuid: string, patchedGame: Partial<UpdateGameDto>) {
    await this.game_repo.update(uuid, patchedGame);
    return await this.findOne(uuid, null);
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
