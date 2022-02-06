import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { Player } from './entities/player.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/service-users/users.service';
import {
  RelationType,
  RelationsService,
} from '../users/service-relations/relations.service';
import { User } from '../users/entities/users.entity';
import { UserDto } from '../users/dtos/user.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private game_repo: Repository<Game>,
    @InjectRepository(Player) private player_repo: Repository<Player>,
    private usersService: UsersService,
    private relationsService: RelationsService,
  ) {}

  isBlocker(blockerList: UserDto[], players: UserDto[]) {
    if (blockerList.find((elem) => elem.id === players[0].id)) {
      throw new ForbiddenException(
        `Sadly ${players[1].login} blocked you... Try be nicer.`,
      );
    }
  }

  private errorUserNotFound(elem: { user: User; login: string }) {
    if (!elem.user) {
      throw new NotFoundException(`${elem.login} not found`);
    }
  }

  private errorPlayerNotOnline(elem: UserDto) {
    if (elem.status !== 'online') {
      throw new ForbiddenException(`${elem.login} is ${elem.status}, dumb`);
    }
  }

  private errorSamePlayer(usr: UserDto[]) {
    if (usr[0].id === usr[1].id) {
      throw new ForbiddenException(
        `${usr[0].login} can't play against themself`,
      );
    }
  }

  private async checkErrors(
    [user1, user2]: User[],
    createGameDto: CreateGameDto,
    callback: Function,
  ) {
    [
      { user: user1, login: createGameDto.loginP1 },
      { user: user2, login: createGameDto.loginP2 },
    ].forEach(this.errorUserNotFound);

    const usersDto = plainToClass(UserDto, [user1, user2]);

    this.errorSamePlayer(usersDto);
    usersDto.forEach(this.errorPlayerNotOnline);

    if (callback) {
      const blockerList = await this.relationsService.readAllRelations(
        user2.id,
        RelationType.Block,
      );
      callback(blockerList, usersDto);
    }
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

  private async getOpponents(createGameDto: CreateGameDto) {
    const user1 = await this.usersService.findLogin(createGameDto.loginP1);
    const user2 = await this.usersService.findLogin(createGameDto.loginP2);
    return [user1, user2];
  }

  async newGame(createGameDto: CreateGameDto, callback: Function) {
    const [user1, opponent] = await this.getOpponents(createGameDto);

    await this.checkErrors([user1, opponent], createGameDto, callback);
    const game_id = await this.createGameTable(user1, opponent);
    return { game_id, ...plainToClass(UserDto, opponent) };
  }

  private async updatePlayernGame(player1: Player, waiting_games: Game[]) {
    let game: Game;
    if (waiting_games.length > 0) {
      game = waiting_games[0];
      player1.game = game;
      game.players.push(player1);
    } else {
      game = this.game_repo.create();
      await this.game_repo.save(game);
      player1.game = game;
      game.players = [player1];
    }
    await this.player_repo.save(player1);
    return await this.game_repo.save(game);
  }

  async joinGame(createGameDto: CreateGameDto) {
    let waiting_games: Game[] = [];
    const user1 = await this.usersService.findLogin(createGameDto.loginP1);
    [{ user: user1, login: createGameDto.loginP1 }].forEach(
      this.errorUserNotFound,
    );

    const player1 = this.player_repo.create({ user: user1 });

    const games = await this.game_repo.find({
      relations: ['players', 'players.user'],
    });
    if (games) {
      waiting_games = games.filter((elem) => {
        return (
          elem.players.length === 1 && elem.players[0].user.id !== user1.id
        );
      });
    }

    let game = await this.updatePlayernGame(player1, waiting_games);
    game = await this.game_repo.findOne(game.id, {
      relations: ['players', 'players.user'],
    });
    return game;
  }

  async findAll() {
    const game = await this.game_repo.find();
    if (!game) {
      throw new NotFoundException('game not found');
    }
    return game;
  }

  //returns a specific game according to its uuid
  async findOne(uuid: string) {
    const game = await this.game_repo.findOne(uuid);
    if (!game) {
      throw new NotFoundException('game not found');
    }
    return game;
  }

  //update a game targeted by its uuid
  async updateGame(uuid: string, patchedGame: UpdateGameDto) {
    await this.game_repo.update(uuid, patchedGame);
    return await this.findOne(uuid);
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
