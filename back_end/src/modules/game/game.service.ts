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
import { User } from '../users/entities/users.entity';
import { UserDto } from '../users/dtos/user.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private game_repo: Repository<Game>,
    @InjectRepository(Player) private player_repo: Repository<Player>,
    private usersService: UsersService,
  ) {}

  private checkErrorCreation(
    user1: User,
    user2: User,
    createGameDto: CreateGameDto,
  ) {
    if (!user1) {
      throw new NotFoundException(
        `${createGameDto.loginP1} not found in database`,
      );
    } else if (!user2) {
      throw new NotFoundException(
        `${createGameDto.loginP2} not found in database`,
      );
    }

    const usr1dto = plainToClass(UserDto, user1);
    const usr2dto = plainToClass(UserDto, user2);

    if (usr1dto.id === usr2dto.id) {
      throw new ForbiddenException(
        `${createGameDto.loginP1} can't play against himself`,
      );
    }

    if (usr1dto.status !== 'online') {
      throw new ForbiddenException(
        `${createGameDto.loginP1} is either offline or playing`,
      );
    } else if (usr2dto.status !== 'online') {
      throw new ForbiddenException(
        `${createGameDto.loginP2} is either offline or playing`,
      );
    }
  }

  async create(createGameDto: CreateGameDto) {
    const user1 = await this.usersService.findLogin(createGameDto.loginP1);
    const user2 = await this.usersService.findLogin(createGameDto.loginP2);

    this.checkErrorCreation(user1, user2, createGameDto);

    const game = this.game_repo.create();
    await this.game_repo.save(game);
    const player1 = this.player_repo.create({ user: user1, game: game });
    const player2 = this.player_repo.create({ user: user2, game: game });
    await this.player_repo.save([player1, player2]);
    game.players = [player1, player2];
    await this.game_repo.save(game);
    return `game ${game.id} successfully created`;
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

  async remove(uuid: string) {
    const game = await this.findOne(uuid);
    return await this.game_repo.remove(game);
  }

  async history() {
    const games = await this.game_repo.find({
      relations: ['players', 'players.user'],
    });
    return games;
  }

  async leaderboard() {
    const allUsers = await this.usersService.getAllPlayersUsers();
    if (!allUsers) throw new NotFoundException(`No users found in database`);
    return allUsers;
  }
}
