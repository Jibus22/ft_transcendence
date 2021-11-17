import { Res, Session } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Condition } from 'typeorm';
import { User } from './entities/users.entity';
import { AuthService } from './service_auth/auth.service';
import { FriendsService } from './service_friends/friends.service';
import { UsersService } from './service_users/users.service';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let configService: ConfigService;
  let controller: UsersController;

  const modelUser: Partial<User> = {
    id: 'idtest',
    login: 'logintest',
    login_42: 'logintest',
    photo_url_42: 'http://photo',
    photo_url_local: null,
    use_local_photo: false,
  };

  let fakeUsersService = {};
  let fakeFriendsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: FriendsService,
          useValue: fakeFriendsService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
