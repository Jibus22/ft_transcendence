import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  PartialType,
} from '@nestjs/swagger';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { editRelationDto } from './dtos/edit-relation.dto';
import { privateUserDto } from './dtos/private-user.dto';
import { UpdateUserDto } from './dtos/update-users.dto';
import { UserDto } from './dtos/user.dto';
import { User } from './entities/users.entity';
import {
  RelationsService,
  RelationType,
} from './service_relations/relations.service';
import { UsersService } from './service_users/users.service';

@ApiTags('Users')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private relationsService: RelationsService,
  ) {}

  @Get('/')
  @Serialize(User)
  @ApiOperation({
    summary: 'Get every users in the database',
  })
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }
  /*****************************************************************************
   *    CURRENTLY LOGGED USER
   *****************************************************************************/

  @Get('/me')
  @Serialize(privateUserDto)
  @ApiOperation({
    summary: 'Get infos of the currently logged user',
  })
  @ApiResponse({ type: User })
  async whoAmI(@CurrentUser() user: User) {
    await this.relationsService // TO DO move to service: separation of concerns
    .getAllRelations(user.id, RelationType.Friend)
    .then((value) => {
      user.friends = value;
    });
    await this.relationsService
    .getAllRelations(user.id, RelationType.Block)
    .then((value) => {
      user.blockedAccounts = value;
    });
    return user;
  }

  @Get('/:id')
  @Serialize(User)
  @ApiOperation({
    summary: 'Get public infors of user :id',
  })
  async getUserById(@Param() id: string) {
    console.log(id);
    return await this.usersService.findOne(id);
  }


  @Patch('/me')
  @Serialize(privateUserDto)
  @ApiOperation({
    summary: 'Update infos of the currently logged user',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ type: UserDto })
  async update(
    @Body() body: Partial<UpdateUserDto>,
    @Session() session: Record<string, any>,
  ) {
    return this.usersService.update(session.userId.id, body);
  }

  /*****************************************************************************
   *    FRIENDS
   *****************************************************************************/

  @Get('/friends')
  @Serialize(User)
  @ApiOperation({
    summary: 'Get list of friends of the currently logger user',
  })
  async getAllFriends(@Session() session: Record<string, any>) {
    return await this.relationsService.getAllRelations(
      session.userId.id,
      RelationType.Friend,
    );
  }

  @Serialize(User)
  @Post('/friends')
  @ApiOperation({
    summary: 'Add one friend to the currently logger user',
  })
  async addFriend(
    @Body() friendId: editRelationDto,
    @Session() session: Record<string, any>,
  ) {
    await this.relationsService.addRelation(
      session.userId.id,
      friendId.id,
      RelationType.Friend,
    );
  }

  @Serialize(User)
  @Delete('/friends')
  @ApiOperation({
    summary: 'Remove one friend to the currently logger user',
  })
  async removeFriend(
    @Body() friendId: editRelationDto,
    @Session() session: Record<string, any>,
  ) {
    return await this.relationsService.removeRelation(
      session.userId.id,
      friendId.id,
      RelationType.Friend,
    );
  }

  /*****************************************************************************
   *    BLOCKED ACCOUNTS
   *****************************************************************************/

  @Get('/block')
  @Serialize(User)
  @ApiOperation({
    summary: 'Get list of blocked accounts of the currently logger user',
  })
  async getAllBlocks(@Session() session: Record<string, any>) {
    return await this.relationsService.getAllRelations(
      session.userId.id,
      RelationType.Block,
    );
  }

  @Post('/block')
  @Serialize(User)
  @ApiOperation({
    summary: 'Add one blocked account to the currently logger user',
  })
  async addBlock(
    @Body() blockId: editRelationDto,
    @Session() session: Record<string, any>,
  ) {
    await this.relationsService.addRelation(
      session.userId.id,
      blockId.id,
      RelationType.Block,
    );
  }

  @Delete('/block')
  @Serialize(User)
  @ApiOperation({
    summary: 'Remove one blocked account to the currently logger user',
  })
  async removeBlock(
    @Body() blockId: editRelationDto,
    @Session() session: Record<string, any>,
  ) {
    await this.relationsService.removeRelation(
      session.userId.id,
      blockId.id,
      RelationType.Block,
    );
  }
}
