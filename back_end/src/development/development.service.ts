import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class DevelopmentService {

	constructor( private usersService: UsersService ) {}

	async debug_logUser(login: string) {
    const users = await this.usersService.find(login);
    if ( ! users[0]) {
      throw new BadRequestException(`No user ${login}`);
    }
    return this.usersService.create(users[0]);
  }

  async debug_createUserBatch(users: Partial<User> | Partial<User>[]) {
    return await this.usersService.create(users).catch((e) => {
      throw new BadRequestException(e.message);
    })
  }

  async debug_deleteUserBatch(users: Partial<User>[]) {
    users.forEach(async (val) => {
      if ( ! val.login) {
        throw new BadRequestException('missing login');
      }
      await this.usersService.remove(val.login).catch((e)=>  {
        throw new BadRequestException(e.message);
      });
    });
  }

}
