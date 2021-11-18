import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Patch,
  Session,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
import { privateUserDto } from './dtos/private-user.dto';
import { UpdateUserDto } from './dtos/update-users.dto';
import { UserDto } from './dtos/user.dto';
import { User } from './entities/users.entity';
import {
  RelationsService,
  RelationType,
} from './service_relations/relations.service';
import { UsersService } from './service_users/users.service';

@ApiTags('Me')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('me')
export class MeController {
  constructor(
    private usersService: UsersService,
    private relationsService: RelationsService,
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
  async whoAmI(@CurrentUser() user: privateUserDto) {
    if (!user) {
      throw new BadRequestException('user session does not exist');
    }
    await this.relationsService // TO DO move to service: separation of concerns
      .getAllRelations(user.id, RelationType.Friend)
      .then((value) => {
        user.friends_list = value;
      })
      .catch((e) => {
        throw new NotFoundException(e.message);
      });
    await this.relationsService
      .getAllRelations(user.id, RelationType.Block)
      .then((value) => {
        user.blocked_list = value;
      });
    return user;
  }

  @Patch('/')
  @Serialize(privateUserDto)
  @ApiOperation({
    summary: 'Update infos of the currently logged user',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ type: UserDto })
  async update(@Body() body: Partial<UpdateUserDto>, @Session() session) {
    return this.usersService.update(session.userId.id, body);
  }
}
