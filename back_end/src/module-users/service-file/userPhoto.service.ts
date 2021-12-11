import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { R_OK } from 'constants';
import { createReadStream, rename, stat, statSync, unlink, unlinkSync } from 'fs';
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
    const extension = extname(file.originalname);
    if (extension.length <= 0) {
      throw {
        status: HttpStatus.BAD_REQUEST,
        error: 'missing file extension',
      };
    }
    const newFileName = file.filename + extension;
    const oldPath = file.path;
    const newPath =
      this.config.get('USERS_PHOTOS_STORAGE_PATH') + '/' + newFileName;

    rename(oldPath, newPath, (error) => {
      if (error) {
        throw error;
      }
    });

    return newFileName;
  }

  async delete(filename: string) {
    const filePath =
      this.config.get('USERS_PHOTOS_STORAGE_PATH') + '/' + filename;


      try {
        unlinkSync(filePath);
      } catch {
        console.log('could not delete previous file');
      }
      // unlink(filePath, (err) => {
      //   if (err) throw 'No file to delete';
      // });
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
