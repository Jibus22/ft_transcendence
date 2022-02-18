import { Test, TestingModule } from '@nestjs/testing';
import { WsConnectionService } from './ws-connection.service';

describe('WsConnectionService', () => {
  let service: WsConnectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WsConnectionService],
    }).compile();

    service = module.get<WsConnectionService>(WsConnectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
