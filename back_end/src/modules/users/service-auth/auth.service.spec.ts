import { Test } from '@nestjs/testing';
import { User } from '../entities/users.entity';
import { UsersService } from '../service-users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // create fake copy of users service
    const users: User[] = [];
    fakeUsersService = {
      // find: (login: string) => {
      //   const filteredUsers = users.filter((users) => users.login === login);
      //   return Promise.resolve(filteredUsers);
      // },

      // create: (login: string, login_42: string) => {
      // 	const user = { login, login_42} as User;
      // 	users.push(user);
      // 	return Promise.resolve(user);
      // }
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('creates an instance of auth service', async () => {
    expect(service).toBeDefined();
  });
});
// it('creates a new user with a salted and hashed password', async () => {
// 	const testPassword = 'aaaaaaaa'
// 	const user = await service.signup('abc@def.com', testPassword);
// 	expect(user.password).not.toEqual(testPassword);
// 	const [salt, hash] = user.password.split('.');
// 	expect(salt).toBeDefined();
// 	expect(hash).toBeDefined();
// });

// ################# SIGNUP

// it('thows an error if email is in use at signup', async () => {
// 	const user = await service.signup('test@test.com', 'pass');
// 	expect(user).toBeDefined();

// 	let promise = service.signup('test@test.com', 'pass');
// 	await expect(promise).rejects.toBeInstanceOf(BadRequestException);

// Testing new signup

// promise = service.signup('test________@test.com', 'pass');
// expect(promise).toBeTruthy();
// });

// // ################# SIGNIN

// it('throws if signin is called with unused email', async () => {
// 	const user = await service.signup('test@test.com', 'pass');
// 	expect(user).toBeDefined();

// 	const promise = service.signin('xxxxxxx@test.com', 'pass');
// 	await expect(promise).rejects.toBeInstanceOf(NotFoundException);
// });

// it('throws if invalid password is provided', async () => {

// 	const user = await service.signup('test@test.com', 'pass');
// 	expect(user).toBeDefined();
// 	const promise = service.signin('test@test.com', 'pass______');
// 	await expect(promise).rejects.toBeInstanceOf(BadRequestException);

// });

// it('returns a user if password is correct', async () => {

// 	await service.signup('a@bc.com', '123');
// 	const user = await service.signin('a@bc.com', '123');
// 	console.log(user);
// 	expect(user).toBeDefined();
// });

// })
