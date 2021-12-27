import {
  BadRequestException,
  Body,
  Controller, Get, HttpStatus, Patch, Res, Session, UseGuards
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../../guards/auth.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
import { privateUserDto } from './dtos/private-user.dto';
import { UpdateUserDto } from './dtos/update-users.dto';
import { User } from './entities/users.entity';
import { MeService } from './service-me/me.service';
import { UsersService } from './service-users/users.service';

@ApiTags('Me')
@ApiCookieAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'User not logged',
})
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
  @UseGuards(AuthGuard)
  @Serialize(privateUserDto)
  @ApiOperation({
    summary: 'Get infos of the currently logged user',
  })
  @ApiResponse({ type: privateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User private informations',
  })
  async whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Get('/is-logged')
  @ApiOperation({
    summary: 'Get authentication status of current user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User is logged with OAuth and header Completed-Auth is set according to 2FA status',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not logged with OAuth',
  })
  async isLogged(@CurrentUser() user: User, @Session() session, @Res() res: Response) {
    if (user.useTwoFA) {
      return res.set('Completed-Auth', session.isTwoFAutanticated).send();
    }
    return res.set('Completed-Auth', 'true').send();
  }

  @Patch('/')
  @UseGuards(AuthGuard)
  @Serialize(privateUserDto)
  @ApiOperation({
    summary: 'Update infos of the currently logged user',
  })
  @ApiResponse({ type: privateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User private informations updated',
  })
  async update(@Body() body: UpdateUserDto, @Session() session) {
    return this.usersService.update(session.userId, body).catch((error) => {
      const message = error.message as string;
      if (message?.includes('UNIQUE')) {
        throw new BadRequestException('already used');
      } else {
        throw new BadRequestException(error);
      }
    });
  }
}
