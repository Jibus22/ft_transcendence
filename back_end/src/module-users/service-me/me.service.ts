import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { timestamp } from 'rxjs';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { UserPhoto } from '../entities/users_photo.entity';
import {
  RelationsService,
  RelationType,
} from '../service-relations/relations.service';
import { UsersService } from '../service-users/users.service';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(UserPhoto) private repoUserPhoto: Repository<UserPhoto>,
    private userService: UsersService,
    private relationsService: RelationsService,
  ) {}

  async whoAmI(userId: string): Promise<User> {
    if (!userId) {
      throw new BadRequestException('user session does not exist');
    }
    let user: User;

    return await this.userService.findOneWithRelations(userId);
  }

  //TODO manage errors
  async uploadPhoto(userId: string, file: Express.Multer.File) {
    console.log(file);


    const user = await this.userService.findOne(userId);
    if (user) {
      const path = file.path;
      console.log("file path is ", path);
      const fileName = user.id + '_extentionHere';

      // do save file to filesystem, construct unique filename
      // .........

      const newPhoto = this.repoUserPhoto.create({ owner: user, fileName });
      await this.repoUserPhoto.save(newPhoto as Partial<UserPhoto>);
        return await this.userService.update(user.id, {
          use_local_photo: true,
        });

    }
  }

  async deletePhoto(userId: string) {
    const user = await this.userService.findOne(userId);
    if (user) {
      const photo = await this.repoUserPhoto.findOne({ owner: user });
      if (photo) {
        await this.repoUserPhoto.remove(photo);
        return await this.userService.update(user.id, {
          use_local_photo: false,
        });
      }
    }
  }
}
