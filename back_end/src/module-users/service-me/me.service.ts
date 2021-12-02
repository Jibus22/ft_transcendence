import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { rename } from 'fs';
import { extname } from 'path/posix';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { UserPhoto } from '../entities/users_photo.entity';
import {
  RelationsService
} from '../service-relations/relations.service';
import { UsersService } from '../service-users/users.service';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(UserPhoto) private repoUserPhoto: Repository<UserPhoto>,
    private config: ConfigService,
    private userService: UsersService,
  ) {}

  async whoAmI(userId: string): Promise<User> {
    if (!userId) {
      throw new BadRequestException('user session does not exist');
    }
    let user: User;

    return await this.userService.findOneWithRelations(userId);
  }

  async uploadPhoto(userId: string, file: Express.Multer.File) {

    console.log(file);

    const user = await this.userService.findOne(userId);
    if (user) {

      const newFileName = file.filename + extname(file.originalname);
      const oldPath = file.path;
      const newPath = this.config.get('USERS_PHOTOS_STORAGE_PATH') + '/' + newFileName;

      rename(oldPath, newPath, (err) => {
        if (err) throw err;
      });

      const currentPhoto = await this.repoUserPhoto.findOne({owner: user});
      if (currentPhoto) {
        await this.repoUserPhoto.remove(currentPhoto);
      }

      const newPhoto = this.repoUserPhoto.create({ owner: user, fileName: newFileName});
      await this.repoUserPhoto.save(newPhoto as Partial<UserPhoto>);

      await this.userService.update(user.id, {
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
