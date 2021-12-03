import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { assert } from 'console';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { UserPhoto } from '../entities/users_photo.entity';
import { UserPhotoService } from '../service-file/userPhoto.service';
import { UsersService } from '../service-users/users.service';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(User) private repoUser: Repository<User>,
    @InjectRepository(UserPhoto) private repoUserPhoto: Repository<UserPhoto>,
    private config: ConfigService,
    private userService: UsersService,
    private userPhotoService: UserPhotoService,
  ) {}

  async whoAmI(userId: string): Promise<User> {
    if (!userId) {
      throw new BadRequestException('user session does not exist');
    }
    let user: User;

    return await this.userService.findOneWithRelations(userId);
  }

  async updateUseLocalPhoto(userId: string, newValue: boolean) {
    const user = await this.repoUser.findOne(userId, {relations: ['photo_url_local']});
    console.log(user);
    if (!user) {
      throw 'user missing in the database';
    } else if (newValue === true && user.photo_url_local === null) {
      throw 'user has no local photo';
    } else if (user.use_local_photo !== newValue) {
      return await this.userService.update(userId, {
        use_local_photo: newValue,
      });
    }
    return user;
  }

  async uploadPhoto(userId: string, file: Express.Multer.File) {
    const user = await this.userService.findOne(userId);

    if (user) {
      const newFileName = this.userPhotoService.addExtensionToFilename(file);
      let userPhoto = await this.repoUserPhoto.findOne({ owner: user });

      if (userPhoto) {
        this.userPhotoService.delete(userPhoto.fileName);
        userPhoto.fileName = newFileName;
      } else {
        userPhoto = this.repoUserPhoto.create({
          owner: user,
          fileName: newFileName,
        });
      }

      await this.repoUserPhoto.save(userPhoto);

      await this.updateUseLocalPhoto(user.id, true);
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
