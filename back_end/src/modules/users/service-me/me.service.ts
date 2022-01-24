import { HttpStatus, Injectable } from '@nestjs/common';
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

  private async updateUseLocalPhoto(user: User, newValue: boolean) {
    if (user.use_local_photo !== newValue) {
      return await this.userService.update(user.id, {
        use_local_photo: newValue,
      });
    }
  }

  private validateFile(file: Express.Multer.File) {
    if (!file.filename || !file.path || !file.mimetype.includes('image/')) {
      throw {
        status: HttpStatus.BAD_REQUEST,
        error: 'file format not supported',
      };
    }
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw {
        status: HttpStatus.BAD_REQUEST,
        error:
          'file is too large, maximum size allowed: ' +
          maxSize / 1024 / 1024 +
          'MiB',
      };
    }
  }

  async uploadPhoto(user: User, file: Express.Multer.File) {
    this.validateFile(file);
    const newFileName = this.usersPhotoService.addExtensionToFilename(file);
    let userPhoto = await this.repoUserPhoto.findOne({ owner: user });

    if (userPhoto) {
      this.usersPhotoService.delete(userPhoto.fileName);
      userPhoto.fileName = newFileName;
      await this.repoUserPhoto.update(userPhoto.id, userPhoto);
    } else {
      userPhoto = this.repoUserPhoto.create({
        owner: user,
        fileName: newFileName,
      });
      await this.repoUserPhoto.save(userPhoto);
    }
    await this.updateUseLocalPhoto(user, true);
  }
  /*
  if (userPhoto) {
      this.usersPhotoService.delete(userPhoto.fileName);
      userPhoto.fileName = newFileName;
    } else {
      userPhoto = this.repoUserPhoto.create({
        owner: user,
        fileName: newFileName,
      });
    }
    await this.updateUseLocalPhoto(user, true);
    await this.repoUserPhoto.save(userPhoto);
  }
*/
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
