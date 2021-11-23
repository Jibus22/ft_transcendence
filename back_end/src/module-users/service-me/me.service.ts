import {
  BadRequestException,
  Injectable
} from '@nestjs/common';
import { User } from '../entities/users.entity';
import { RelationsService, RelationType } from '../service-relations/relations.service';
import { UsersService } from '../service-users/users.service';

@Injectable()
export class MeService {
  constructor(
    private userService: UsersService,
    private relationsService: RelationsService,
    ) {}

  create() {}
  update() {}
  delete() {}

  async whoAmI(userId: string): Promise<User> {
    if (!userId) {
      throw new BadRequestException('user session does not exist');
    }
    let user: User;
    return await this.userService
      .findOne(userId)
      .then((foundUser) => {
        if (! foundUser ) {
          throw 'user not found in database';
        }
        user = foundUser;
        return this.relationsService.readAllRelations(user.id, RelationType.Friend);
      })
      .then((friends) => {
        user.friends_list = friends;
        return this.relationsService.readAllRelations(user.id, RelationType.Block);
      })
      .then((blocked) => {
        user.blocked_list = blocked;
        return user;
      })
  }
}
