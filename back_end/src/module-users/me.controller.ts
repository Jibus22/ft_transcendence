import {
  BadRequestException,
  Body,
  Controller, Get, HttpStatus, NotFoundException, Patch, Post, Session,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
import { privateUserDto } from './dtos/private-user.dto';
import { UpdateUserDto } from './dtos/update-users.dto';
import { User } from './entities/users.entity';
import { MeService } from './service-me/me.service';
import { UsersService } from './service-users/users.service';

@ApiTags('Me')
@ApiCookieAuth()
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User not logged' })
@UseGuards(AuthGuard)
@Controller('me')
export class MeController {
  constructor(
    private usersService: UsersService,
    private meService: MeService,
  ) {}

  /*****************************************************************************
   *    CURRENTLY LOGGED USER INFOS
   *****************************************************************************/

  @Get('/')
  @Serialize(privateUserDto)
  @ApiOperation({
    summary: 'Get infos of the currently logged user',
  })
  @ApiResponse({ type: privateUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'User private informations' })
  async whoAmI(@CurrentUser() userId: string) {
    return await this.meService.whoAmI(userId)
      .then((userData: User) => userData)
      .catch((error) => {throw new NotFoundException(error);});
  }

  @Patch('/')
  @Serialize(privateUserDto)
  @ApiOperation({
    summary: 'Update infos of the currently logged user',
  })
  @ApiResponse({ type: privateUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'User private informations updated' })
  async update(@Body() body: UpdateUserDto, @Session() session) {
    return this.usersService.update(session.userId, body)
    .catch((error) => {throw new BadRequestException(error.message);});
  }

  @Post('/photo')
  @UseInterceptors(FileInterceptor('file'))
  @Serialize(privateUserDto)
  @ApiOperation({
    summary: 'Post a new profile picture and set use_local_photo to true',
  })
  @ApiResponse({ type: privateUserDto })
  async uploadPhoto(@CurrentUser() userId: string, @UploadedFile() file: Express.Multer.File) {
    return await this.meService.uploadPhoto(userId, file);
  }

}
