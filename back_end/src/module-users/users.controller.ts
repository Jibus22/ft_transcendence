import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { Serialize } from '../interceptors/serialize.interceptor';
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

  @Get('/:login')
  @ApiOperation({
    summary: 'Get public infos of user :login',
  })
  async getUserById(@Param() {login}) {
    console.log(login);
    const user = await this.usersService.find(login)
      .then( (user) => {
        if (user[0]) {
          return user[0];
        } else {
          throw new NotFoundException();
        }
      })
      .catch( (error) => {throw new NotFoundException()});
    console.log(user);
    return user;
  }

  /*****************************************************************************
   *    FRIENDS
   *****************************************************************************/

  @Get('/friends')
  @ApiOperation({
    summary: 'Get list of friends of the currently logger user',
  })
  async readAllFriends(@Session() session: Record<string, any>) {
    return await this.relationsService.readAllRelations(
      session.userId,
      RelationType.Friend,
    );
  }

  @Post('/friends')
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

  @Delete('/friends')
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
