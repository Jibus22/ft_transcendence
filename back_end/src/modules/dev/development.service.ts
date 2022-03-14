import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';
import { UserDto } from '../users/dtos/user.dto';
import { plainToClass } from 'class-transformer';
import { Game } from '../game/entities/game.entity';
import { Player } from '../game/entities/player.entity';

@Injectable()
export class DevelopmentService {
  constructor(
    @InjectRepository(User) private repoUser: Repository<User>,
    @InjectRepository(Player) private player_repo: Repository<Player>,
    @InjectRepository(Game) private game_repo: Repository<Game>,
    private usersService: UsersService,
  ) {}

  async dev_logUser(login: string) {
    const users = await this.repoUser.find({
      where: { login },
    });
    if (!users[0]) {
      throw new BadRequestException(`No user ${login}`);
    }
    return this.usersService.create(users[0]).catch((error) => {
      throw new BadRequestException(error.message);
    });
  }

  async dev_createUserBatch(users: Partial<User>) {
    return await this.usersService.create(users);
  }

  async dev_deleteUserBatch(users: Partial<User>[]) {
    users.forEach(async (val) => {
      if (val.login) {
        return await this.usersService
          .remove(val.login)
          .then((val) => val)
          .catch((e) => {
            throw new BadRequestException(e);
          });
      }
    });
  }

  async dev_getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  async dev_deleteAllUser() {
    const users = await this.usersService.getAllUsers();
    await this.dev_deleteUserBatch(users);
  }

  async createRandomGames() {
    const users = await this.usersService.getAllUsers();
    const usrdto = plainToClass(UserDto, users);
    const onlineusers = usrdto.filter((element) => {
      return element.status === 'online';
    });

    for (let i = 0; i < 10; i++) {
      let usr1 = onlineusers[Math.floor(Math.random() * onlineusers.length)];
      let usr2 = onlineusers[Math.floor(Math.random() * onlineusers.length)];
      if (usr1.id === usr2.id) continue;

      const user1 = await this.usersService.findLogin(usr1.login);
      const user2 = await this.usersService.findLogin(usr2.login);

      if (!user1 || !user2) continue;

      const game = this.game_repo.create();
      await this.game_repo.save(game);

      let score2: number;
      let score1 = Math.floor(Math.random() * 11);
      if (score1 !== 10) score2 = 10;
      else score2 = Math.floor(Math.random() * 10);

      let player1 = this.player_repo.create({
        score: score1,
        user: user1,
        game: game,
      });
      let player2 = this.player_repo.create({
        score: score2,
        user: user2,
        game: game,
      });

      await this.player_repo.save([player1, player2]);
      game.players = [player1, player2];
      await this.game_repo.save(game);
    }
  }
}
