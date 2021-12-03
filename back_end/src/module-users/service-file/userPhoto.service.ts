import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { rename, unlink } from 'fs';
import { extname } from 'path';
import { Repository } from 'typeorm';
import { UserPhoto } from '../entities/users_photo.entity';

@Injectable()
export class UserPhotoService {
  constructor(
    @InjectRepository(UserPhoto) private repoUserPhoto: Repository<UserPhoto>,
    private config: ConfigService,
  ) {}

  addExtensionToFilename(file: Express.Multer.File) {
    const newFileName = file.filename + extname(file.originalname);
    const oldPath = file.path;
    const newPath =
      this.config.get('USERS_PHOTOS_STORAGE_PATH') + '/' + newFileName;

    rename(oldPath, newPath, (err) => {
      if (err) throw err;
    });

    return newFileName;
  }

  delete(filename: string) {
    unlink(this.config.get('USERS_PHOTOS_STORAGE_PATH') + '/' + filename, (err) => {
      if (err) console.log(err.message);
    })
  }
}
