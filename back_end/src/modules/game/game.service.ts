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

  isFriend(friends_list: UserDto[], opponent_id: string) {
    return friends_list.filter((elem) => elem.id === opponent_id).length === 1;
  }

  private errorUserNotFound(user: User, login: string) {
    if (!user) {
      throw new NotFoundException(`${login} not found`);
    }
  }

  private errorPlayerNotOnline(usr: UserDto, login: string) {
    if (usr.status !== 'online') {
      throw new ForbiddenException(`${login} is either offline or playing`);
    }
  }

  private async checkErrors(
    [user1, user2]: User[],
    createGameDto: CreateGameDto,
    callback: Function,
  ) {
    this.errorUserNotFound(user1, createGameDto.loginP1);
    this.errorUserNotFound(user2, createGameDto.loginP2);

    const [usr1dto, usr2dto] = plainToClass(UserDto, [user1, user2]);

    if (usr1dto.id === usr2dto.id) {
      throw new ForbiddenException(
        `${createGameDto.loginP1} can't play against himself`,
      );
    }

    this.errorPlayerNotOnline(usr1dto, createGameDto.loginP1);
    this.errorPlayerNotOnline(usr2dto, createGameDto.loginP2);

    if (callback) {
      const friend_list = await this.relationsService.readAllRelations(
        user1.id,
        RelationType.Friend,
      );
      if (!callback(friend_list, user2.id)) {
        throw new ForbiddenException(
          `${createGameDto.loginP2} isn't your friend. Go to make some friends`,
        );
      }
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
    this.errorUserNotFound(user1, createGameDto.loginP1);

    const player1 = this.player_repo.create({ user: user1 });

    const games = await this.game_repo.find({ relations: ['players'] });
    if (games) {
      waiting_games = games.filter((elem) => {
        return elem.players.length === 1;
      });
    }

    const game = await this.updatePlayernGame(player1, waiting_games);
    const test = await this.game_repo.findOne(game.id, {
      relations: ['players', 'players.user'],
    });
    return test;
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

  //update score of a game targeted by its uuid
  async update(uuid: string, updateGameDto: UpdateGameDto) {
    await this.game_repo.update(uuid, {
      // scoreP1: updateGameDto.scoreP1,
      // scoreP2: updateGameDto.scoreP2,
    });
    return await this.findOne(uuid);
  }

  //TODO: remove en cascade : il faut aussi remove les players correspondant
  async remove(uuid: string) {
    const game = await this.findOne(uuid);
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
