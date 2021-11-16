import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './service_auth/auth.service';
import { FriendsService } from './service_friends/friends.service';
import { UsersService } from './service_users/users.service';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let fakeUsersService: Partial<UsersService>
  let fakeAuthService: Partial<AuthService>
  let fakeFriendsService: Partial<FriendsService>

  let controller: UsersController;

   beforeEach(async () => {

    const fakeUsersService = {

    }

    const fakeAuthService = {

    }

    const fakeFriendsService = {

    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        ConfigService,
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        },
        {
          provide: FriendsService,
          useValue: fakeFriendsService
        }
      ]
    })
    .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

});
