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

  // @Get('/:id')
  // @ApiOperation({
  //   summary: 'Get public infors of user :id',
  // })
  // async getUserById(@Param() id: string) {
  //   console.log(id);
  //   return await this.usersService.findOne(id);
  // }

  /*****************************************************************************
   *    FRIENDS
   *****************************************************************************/

  @Get('/friends')
  @ApiOperation({
    summary: 'Get list of friends of the currently logger user',
  })
  async getAllFriends(@Session() session: Record<string, any>) {
    return await this.relationsService.getAllRelations(
      session.userId,
      RelationType.Friend,
    );
  }

  @Post('/friends')
  @ApiOperation({
    summary: 'Add one friend to the currently logger user',
  })
  async addFriend(
    @Body() friendId: editRelationDto,
    @Session() session: Record<string, any>,
  ) {
    await this.relationsService.addRelation(
      session.userId,
      friendId.id,
      RelationType.Friend,
    );
  }

  @Delete('/friends')
  @ApiOperation({
    summary: 'Remove one friend to the currently logger user',
  })
  async removeFriend(
    @Body() friendId: editRelationDto,
    @Session() session: Record<string, any>,
  ) {
    return await this.relationsService.removeRelation(
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
  async getAllBlocks(@Session() session: Record<string, any>) {
    return await this.relationsService.getAllRelations(
      session.userId,
      RelationType.Block,
    );
  }

  @Post('/block')
  @ApiOperation({
    summary: 'Add one blocked account to the currently logger user',
  })
  async addBlock(
    @Body() blockId: editRelationDto,
    @Session() session: Record<string, any>,
  ) {
    await this.relationsService.addRelation(
      session.userId,
      blockId.id,
      RelationType.Block,
    );
  }

  @Delete('/block')
  @ApiOperation({
    summary: 'Remove one blocked account to the currently logger user',
  })
  async removeBlock(
    @Body() blockId: editRelationDto,
    @Session() session: Record<string, any>,
  ) {
    await this.relationsService.removeRelation(
      session.userId,
      blockId.id,
      RelationType.Block,
    );
  }
}
