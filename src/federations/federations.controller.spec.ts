import { Test, TestingModule } from '@nestjs/testing';
import { FederationsController } from './federations.controller';
import { FederationsService } from './federations.service';

describe('FederationsController', () => {
  let controller: FederationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FederationsController],
      providers: [FederationsService],
    }).compile();

    controller = module.get<FederationsController>(FederationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
