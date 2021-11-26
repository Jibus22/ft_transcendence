import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param, Post, Session,
  UseGuards
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation, ApiTags
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { editRelationDto } from './dtos/edit-relation.dto';
import { UserDto } from './dtos/user.dto';
import {
  RelationsService,
  RelationType
} from './service-relations/relations.service';
import { UsersService } from './service-users/users.service';

@ApiTags('Users')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Serialize(UserDto)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private relationsService: RelationsService,
  ) {}

  @Get('/')
  @ApiOperation({
    summary: 'Get every users in the database',
  })
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Get('/id/:login')
  @ApiOperation({
    summary: 'Get public infos of user :login',
  })
  async getUserById(@Param() {login}) {
    const user = await this.usersService.find(login)
      .then( (user) => {
        if (user[0]) {
          return user[0];
        } else {
          throw new NotFoundException('user not found');
        }
      });
    return user;
  }

  /*****************************************************************************
   *    FRIENDS
   *****************************************************************************/

  @Get('/friend')
  @ApiOperation({
    summary: 'Get list of friends of the currently logger user',
  })
  async readAllFriends(@Session() session: Record<string, any>) {
    return await this.relationsService.readAllRelations(
      session.userId,
      RelationType.Friend,
    );
  }

  @Post('/friend')
  @ApiOperation({
    summary: 'Add one friend to the currently logger user',
  })
  async createFriend(
    @Body() friendId: editRelationDto,
    @Session() session: Record<string, any>,
  ) {
    await this.relationsService.createRelation(
      session.userId,
      friendId.id,
      RelationType.Friend,
    );
  }

  @Delete('/friend')
  @ApiOperation({
    summary: 'Remove one friend to the currently logger user',
  })
  async deeleteFriend(
    @Body() friendId: editRelationDto,
    @Session() session: Record<string, any>,
  ) {
    return await this.relationsService.deleteRelation(
      session.userId,
      friendId.id,
      RelationType.Friend,
    );
  }

  /*****************************************************************************
   *    BLOCKED ACCOUNTS
   *****************************************************************************/

  @Get('/block')
  @ApiOperation({
    summary: 'Get list of blocked accounts of the currently logger user',
  })
  async readAllBlocks(@Session() session: Record<string, any>) {
    return await this.relationsService.readAllRelations(
      session.userId,
      RelationType.Block,
    );
  }

  @Post('/block')
  @ApiOperation({
    summary: 'Add one blocked account to the currently logger user',
  })
  async createBlock(
    @Body() blockId: editRelationDto,
    @Session() session: Record<string, any>,
  ) {
    await this.relationsService.createRelation(
      session.userId,
      blockId.id,
      RelationType.Block,
    );
  }

  @Delete('/block')
  @ApiOperation({
    summary: 'Remove one blocked account to the currently logger user',
  })
  async deleteBlock(
    @Body() blockId: editRelationDto,
    @Session() session: Record<string, any>,
  ) {
    await this.relationsService.deleteRelation(
      session.userId,
      blockId.id,
      RelationType.Block,
    );
  }
}
