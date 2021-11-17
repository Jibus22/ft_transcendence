import { Req, Session } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Any } from 'typeorm';
import { AuthController } from './auth.controller';
import { User } from './entities/users.entity';
import { AuthService } from './service_auth/auth.service';

describe('AuthController', () => {

  const modelUser: Partial<User> = {
    id: 'idtest',
    login: 'logintest',
    login_42: 'logintest',
    photo_url_42: 'http://photo',
    photo_url_local: null,
    use_local_photo: false,
  };

  let controller: AuthController;
  let config: ConfigService;

  let fakeAuthService: Partial<AuthService> = {

    registerUser: (queryCode: string, queryState: string) => {
      return new Promise<User>((resolve, fail) => {
        resolve(modelUser as User);
      })
    }
  };

  let fakeConfigService: Partial<ConfigService> = {
    get: (value: string) => {
      return (value) ;
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: fakeAuthService
        },
        {
          provide: ConfigService,
          useValue: fakeConfigService
        },
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
    config = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
