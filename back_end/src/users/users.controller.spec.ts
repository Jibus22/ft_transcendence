import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './users.entity'
import { find } from 'rxjs';
import { BadGatewayException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>
  let fakeAuthService: Partial<AuthService>
  beforeEach(async () => {

    fakeUsersService = {
      // findOne: (id: number) => {
      //   return Promise.resolve({id} as User);
      // },
      // find: (email: string) => {
      //   return Promise.resolve([
      //     ({id} as User)
      //   ]);
      // }
      // update: () => {},
      // remove: () => {}

    };
    fakeAuthService = {
      // signin: (email: string, password: string) => {
      //   return Promise.resolve({ id: 1, email, password} as User);
      //  },
      // signup: () => { }
    };


    // Implement here the fake objects

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        }

      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  // it('should be defined', () => {
  //   expect(controller).toBeDefined();
  // });

  // it('findAllUsers returns a list of users with a given email', async () => {

  //   const users = await controller.findAllUsers('abc@mail.com');

  //   expect(users.length).toEqual(1);
  //   expect(users[0].email).toEqual('abc@mail.com');
  // });

  // it('findUser returns a single user with a given id', async () => {

  //   const user = await controller.findUser('abc@mail.com');

  //   expect(user).toBeDefined();
  // });

  // it('findUser thows an error is user with given email does not exist', async () => {

  //   // reimplement
  //   fakeUsersService.findOne = () => null;

  //   const promise = controller.findUser('abc@mail.com');
  //   await expect(promise).rejects.toBeInstanceOf(NotFoundException);
  // });

  // it('signin updates session object and returns user', async () => {
  //   const session = { userId: -1 };
  //                                           // @body equivalent                    @session
  //   const user = await controller.signin({email: 'abc@dhjd.com', password: 'abc'}, session);

  //   expect(user.id).toEqual(1);
  //   expect(session.userId).toEqual(1);

  // });

// });
