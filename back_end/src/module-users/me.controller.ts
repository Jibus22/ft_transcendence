import {
  Body,
  Controller, Get, NotFoundException, Patch, Session,
  UseGuards
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
import { privateUserDto } from './dtos/private-user.dto';
import { UpdateUserDto } from './dtos/update-users.dto';
import { User } from './entities/users.entity';
import { MeService } from './service-me/me.service';
import { UsersService } from './service-users/users.service';

@ApiTags('Me')
@ApiCookieAuth()
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
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ type: privateUserDto })
  async update(@Body() body: Partial<UpdateUserDto>, @Session() session) {
    return this.usersService.update(session.userId, body);
  }
}
