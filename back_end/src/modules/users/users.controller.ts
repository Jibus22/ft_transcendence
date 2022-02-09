import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
import { editRelationDto } from './dtos/edit-relation.dto';
import { UserDto } from './dtos/user.dto';
import { User } from './entities/users.entity';
import {
  RelationsService,
  RelationType,
} from './service-relations/relations.service';
import { UsersService } from './service-users/users.service';

@ApiTags('Users')
@ApiCookieAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'User not logged',
})
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
  @ApiResponse({ type: UserDto, isArray: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users array' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No users' })
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Get('/profile/:login')
  @ApiOperation({
    summary: 'Get public infos of user :login',
  })
  @ApiResponse({ type: UserDto, isArray: false })
  @ApiResponse({ status: HttpStatus.OK, description: "User's public data" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No user' })
  async getUserById(@Param('login') login: string) {
    return await this.usersService.find({ login }).then((users) => {
      if (!users[0]) {
        throw new NotFoundException('user not found');
      }
      return users[0];
    });
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        FRIENDS
  -------------------------------------------------------------------
  ===================================================================
  */

  @Get('/friend')
  @ApiOperation({
    summary: 'Get list of friends of the currently logger user',
  })
  @ApiResponse({ type: UserDto, isArray: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Array of users in the friends list',
  })
  async readAllFriends(@CurrentUser() user: User) {
    return await this.relationsService.readAllRelations(
      user.id,
      RelationType.Friend,
    );
  }

  @Post('/friend')
  @ApiOperation({
    summary: 'Add one friend to the currently logger user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully added',
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Failed to add' })
  async createFriend(
    @Body() target: editRelationDto,
    @CurrentUser() user: User,
  ) {
    await this.relationsService.createRelation(
      user.id,
      target.id,
      RelationType.Friend,
    );
  }

  @Delete('/friend')
  @ApiOperation({
    summary: 'Remove one friend to the currently logger user',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully deleted' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Failed to delete' })
  async deleteFriend(
    @Body() target: editRelationDto,
    @CurrentUser() user: User,
  ) {
    return await this.relationsService.deleteRelation(
      user.id,
      target.id,
      RelationType.Friend,
    );
  }

  /*
  ===================================================================
  -------------------------------------------------------------------
        BLOCKED ACCOUNTS
  -------------------------------------------------------------------
  ===================================================================
  */

  @Get('/block')
  @ApiOperation({
    summary: 'Get list of blocked accounts of the currently logger user',
  })
  @ApiResponse({ type: UserDto, isArray: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Array of users in the blocked list',
  })
  async readAllBlocks(@CurrentUser() user: User) {
    return await this.relationsService.readAllRelations(
      user.id,
      RelationType.Block,
    );
  }

  @Post('/block')
  @ApiOperation({
    summary: 'Add one blocked account to the currently logger user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully added',
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Failed to add' })
  async createBlock(
    @Body() target: editRelationDto,
    @CurrentUser() user: User,
  ) {
    await this.relationsService.createRelation(
      user.id,
      target.id,
      RelationType.Block,
    );
  }

  @Delete('/block')
  @ApiOperation({
    summary: 'Remove one blocked account to the currently logger user',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully deleted' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Failed to delete' })
  async deleteBlock(
    @Body() target: editRelationDto,
    @CurrentUser() user: User,
  ) {
    await this.relationsService.deleteRelation(
      user.id,
      target.id,
      RelationType.Block,
    );
  }
}
