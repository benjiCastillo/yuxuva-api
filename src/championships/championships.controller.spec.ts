import { Test, TestingModule } from '@nestjs/testing';
import { ChampionshipsController } from './championships.controller';
import { ChampionshipsService } from './championships.service';

describe('ChampionshipsController', () => {
  let controller: ChampionshipsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChampionshipsController],
      providers: [ChampionshipsService],
    }).compile();

    controller = module.get<ChampionshipsController>(ChampionshipsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
