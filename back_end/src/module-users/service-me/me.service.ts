import {
  BadRequestException,
  Injectable
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { timestamp } from 'rxjs';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { UserPhoto } from '../entities/users_photo.entity';
import { RelationsService, RelationType } from '../service-relations/relations.service';
import { UsersService } from '../service-users/users.service';

@Injectable()
export class MeService {
  constructor(
		@InjectRepository(User) private repoUserPhoto: Repository<UserPhoto>,
    private userService: UsersService,
    private relationsService: RelationsService,
    ) {}

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

    async uploadPhoto(userId: string, file: Express.Multer.File) {
      const user = await this.userService.findOne(userId);
      if (user) {
        console.log('found ->', user);
        const photo = this.repoUserPhoto.create({fileName: 'test'});
        console.log(photo);
        return await this.repoUserPhoto.save(photo as Partial<UserPhoto>);
      }
    }
}
