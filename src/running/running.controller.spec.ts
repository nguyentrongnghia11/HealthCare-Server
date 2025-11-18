import { Test, TestingModule } from '@nestjs/testing';
import { RunningController } from './running.controller';
import { RunningService } from './running.service';

describe('RunningController', () => {
  let controller: RunningController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RunningController],
      providers: [RunningService],
    }).compile();

    controller = module.get<RunningController>(RunningController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
