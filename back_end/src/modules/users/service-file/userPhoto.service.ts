import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  StreamableFile
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream, renameSync, statSync, unlink } from 'fs';
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

    try {
      renameSync(oldPath, newPath);
    } catch (error) {
      const logger = new Logger('fileSystem');
      logger.log(`Rename failed: ${error}`);
      throw {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'could not store the file',
      };
    }
    return newFileName;
  }

  delete(filename: string) {
    const filePath =
      this.config.get('USERS_PHOTOS_STORAGE_PATH') + '/' + filename;

    unlink(filePath, (error) => {
      if (error) {
        const logger = new Logger('fileSystem');
        logger.log(`Unlink failed: ${error}`);
      }
    });
  }

  async serveFile(filename: string, res) {
    let path = join(this.config.get('USERS_PHOTOS_STORAGE_PATH'), filename);
    try {
      const stat = statSync(path);
      if (stat.isFile()) {
        const mime = require('mime-types');
        const file = createReadStream(path);
        res.set({
          'Content-Type': mime.lookup(path),
          'Content-Disposition': `attachment; filename=${filename}`,
        });
        return new StreamableFile(file);
      }
      return new ForbiddenException(`${filename} is a directory`);
    } catch (err) {
      throw {
        status: HttpStatus.NOT_FOUND,
        error: 'file not found',
      };
    }
  }
}
