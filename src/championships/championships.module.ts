import { Module } from '@nestjs/common';
import { ChampionshipsService } from './championships.service';
import { ChampionshipsController } from './championships.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [ChampionshipsController],
  providers: [ChampionshipsService],
  imports: [PrismaModule],
})
export class ChampionshipsModule {}
