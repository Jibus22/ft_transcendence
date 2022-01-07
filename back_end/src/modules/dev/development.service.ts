import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/service-users/users.service';

@Injectable()
export class DevelopmentService {
  constructor(
    @InjectRepository(User) private repoUser: Repository<User>,
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
}
