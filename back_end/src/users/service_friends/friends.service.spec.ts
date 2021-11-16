import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../entities/users.entity';
import { UsersService } from '../service_users/users.service';
import { FriendsService } from './friends.service';

describe('FriendsService', () => {
  let service: FriendsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FriendsService],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
