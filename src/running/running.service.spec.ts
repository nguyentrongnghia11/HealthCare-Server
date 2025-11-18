import { Test, TestingModule } from '@nestjs/testing';
import { RunningService } from './running.service';

describe('RunningService', () => {
  let service: RunningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RunningService],
    }).compile();

    service = module.get<RunningService>(RunningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
