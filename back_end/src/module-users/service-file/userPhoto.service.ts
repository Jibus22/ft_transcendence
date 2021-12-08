import { ForbiddenException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { R_OK } from 'constants';
import { createReadStream, rename, unlink } from 'fs';
import { extname, join } from 'path';
import { Repository } from 'typeorm';
import { UserPhoto } from '../entities/users_photo.entity';

@Injectable()
export class UsersPhotoService {
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
    unlink(
      this.config.get('USERS_PHOTOS_STORAGE_PATH') + '/' + filename,
      (err) => {
        if (err) console.log(err.message);
      },
    );
  }

  async serveFile(filename: string, res) {
    const fsPromises = require('fs').promises;
    let path = join(this.config.get('USERS_PHOTOS_STORAGE_PATH'), filename);
    try {
      const stat = await fsPromises.stat(path, R_OK);
      if (!stat.isFile()) {
        return new ForbiddenException();
      }
      const mime = require('mime-types');
      const file = createReadStream(path);
      console.log(file.readableLength);
      res.set({
        'Content-Type': mime.lookup(path),
        'Content-Disposition': `attachment; filename=${filename}`,
      });
      return new StreamableFile(file);
    } catch (err) {
      return new NotFoundException();
    }
  }
}
