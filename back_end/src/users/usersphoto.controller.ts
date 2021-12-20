import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException, Param,
  Post,
  Response,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
import { privateUserDto } from './dtos/private-user.dto';
import { User } from './entities/users.entity';
import { UsersPhotoService } from './service-file/userPhoto.service';
import { MeService } from './service-me/me.service';

@ApiTags('Photos')
@UseGuards(AuthGuard)
@Controller()
export class UsersPhotoController {
  constructor(
    private usersPhotoService: UsersPhotoService,
    private meService: MeService,
  ) {}

  /*
  ===================================================================
  -------------------------------------------------------------------
        SET /me PHOTO
  -------------------------------------------------------------------
  ===================================================================
  */

  @Post('/me/photo')
  @UseInterceptors(
    FileInterceptor('file', { dest: `/usr/assets/users_photos` }),
  ) // TODO: change to env.
  @Serialize(privateUserDto)
  @ApiResponse({ type: privateUserDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'something is wrong with the file',
  })
  @ApiOperation({
    summary: 'Upload a new custome photo and swtich to use it',
  })
  async uploadPhoto(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    ) {
    await this.meService.uploadPhoto(user, file)
    .catch((error) => {
      this.usersPhotoService.delete(file.filename)
      if (error.status) {
        throw new HttpException(error, error.status);
      }
      else {
        throw new InternalServerErrorException(error);
      }
    });
  }

  @Post('/me/useSchoolPhoto')
  @Serialize(privateUserDto)
  @ApiOperation({
    summary: 'Set user avatar url to School42 photo',
  })
  @ApiResponse({ type: privateUserDto })
  async useSchoolPhoto(@CurrentUser() user: User) {
    this.usersPhotoService.delete(user.local_photo.fileName);
    return await this.meService.deletePhoto(user);
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        SERVE PHOTOS
  -------------------------------------------------------------------
  ===================================================================
  */

  @Get('/users/photos/:fileName')
  @ApiOperation({
    summary: 'Get user photo',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: StreamableFile,
    description: 'file requested',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'file requested not found',
  })
  async servePhoto(
    @Param('fileName') fileName,
    @Response({ passthrough: true }) res,
  ) {
    return await this.usersPhotoService.serveFile(fileName, res)
      .catch((error) => {
      if (error.status) {
        throw new HttpException(error, error.status);
      }
      else {
        throw new InternalServerErrorException(error);
      }
    });
  }
}
