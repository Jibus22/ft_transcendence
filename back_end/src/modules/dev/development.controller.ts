import { Session, UseGuards, Controller, Post, Body, Get, Delete } from "@nestjs/common";
import { ApiTags, ApiProperty } from "@nestjs/swagger";
import { DevGuard } from "../../guards/dev.guard";
import { Serialize } from "../../interceptors/serialize.interceptor";
import { privateUserDto } from "../users/dtos/private-user.dto";
import { UserDto } from "../users/dtos/user.dto";
import { User } from "../users/entities/users.entity";
import { DevelopmentService } from "./development.service";

@ApiTags('DevTools')
@Serialize(privateUserDto)
@UseGuards(DevGuard)
@Controller('dev')
export class DevelopmentController {
  constructor(private developmentService: DevelopmentService) {}

  @ApiProperty()
  @Post('/signin')
  async logDebugUser(@Body() user: {login: string}, @Session() session: any) {
    const newUser = await this.developmentService.dev_logUser(user.login);
    session.userId = newUser.id;
    session.useTwoFA = newUser.useTwoFA;
    session.isTwoFAutanticated = false;
    return newUser;
  }

  @ApiProperty()
  @Get('/users')
  async getAllUsers() {
    return this.developmentService.dev_getAllUsers();

  }

  @ApiProperty()
  @Post('/createUserBatch')
  async createUserBatch(
    @Body() body: UserDto[] | UserDto,
    ) {
      let successCreation = 0;
      const users: Partial<User>[] = body as UserDto[];
      for (const user of users) {
         await this.developmentService.dev_createUserBatch(user)
          .then((value) => { successCreation++; })
          .catch((err) => {});
      };
      return await this.developmentService.dev_getAllUsers();
    }

  @ApiProperty()
  @Delete('/deleteUserBatch')
  async deleteUserBatch(
    @Body() body: { login: string }[],
  ) {
    await this.developmentService.dev_deleteUserBatch(body);
  }

  @ApiProperty()
  @Delete('/deleteAllUsers')
  async deleteAllUsers() {
    await this.developmentService.dev_deleteAllUser();
  }
}
