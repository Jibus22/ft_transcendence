import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { UserPhoto } from '../entities/users_photo.entity';
import { UsersPhotoService } from '../service-file/userPhoto.service';
import { UsersService } from '../service-users/users.service';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(User) private repoUser: Repository<User>,
    @InjectRepository(UserPhoto) private repoUserPhoto: Repository<UserPhoto>,
    private userService: UsersService,
    private usersPhotoService: UsersPhotoService,
  ) {}

  async updateUseLocalPhoto(user: User, newValue: boolean) {
    if (user) {
      if (newValue === true && user.photo_url_local === null) {
        throw 'user has no local photo';
      }
      if (user.use_local_photo !== newValue) {
        return await this.userService.update(user.id, {
          use_local_photo: newValue,
        });
      }
    }
  }

  async uploadPhoto(user: User, file: Express.Multer.File) {
    if (user) {
      const newFileName = this.usersPhotoService.addExtensionToFilename(file);
      let userPhoto = await this.repoUserPhoto.findOne({ owner: user });

      if (userPhoto) {
        this.usersPhotoService.delete(userPhoto.fileName);
        userPhoto.fileName = newFileName;
      } else {
        userPhoto = this.repoUserPhoto.create({
          owner: user,
          fileName: newFileName,
        });
      }

      await this.repoUserPhoto.save(userPhoto);
      await this.updateUseLocalPhoto(user, true);
    }
  }

  async deletePhoto(user: User) {
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
