import {
	Controller,
	Get,
	HttpStatus, Param,
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
  @Serialize(privateUserDto)
  @UseInterceptors(
    FileInterceptor('file', { dest: `/usr/assets/users_photos` }),
  ) // TODO: change to env.
  @Serialize(privateUserDto)
  @ApiOperation({
    summary: 'Upload a new custome photo and swtich to use it',
  })
  @ApiResponse({ type: privateUserDto })
  async uploadPhoto(
    @CurrentUser() userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.meService
      .uploadPhoto(userId, file)
      .catch((error) => console.log('error', error.message)); // TODO manage properly
  }

  @Post('/me/useSchoolPhoto')
  @Serialize(privateUserDto)
  @ApiOperation({
    summary: 'Set user avatar url to School42 photo',
  })
  @ApiResponse({ type: privateUserDto })
  async useSchoolPhoto(@CurrentUser() userId: string) {
    return await this.meService.deletePhoto(userId);
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
  servePhoto(
    @Param('fileName') fileName,
    @Response({ passthrough: true }) res,
  ) {
    return this.usersPhotoService.serveFile(fileName, res);
  }
}
