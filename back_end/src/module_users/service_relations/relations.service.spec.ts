import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../entities/users.entity';
import { UsersService } from '../service_users/users.service';
import { RelationsService } from './relations.service';

describe('relationsService', () => {
  let service: RelationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RelationsService],
    }).compile();

    service = module.get<RelationsService>(RelationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
