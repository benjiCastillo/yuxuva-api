import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChampionshipCalendarsController } from './championship-calendars.controller';
import { ChampionshipCalendarsService } from './championship-calendars.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChampionshipCalendarsController],
  providers: [ChampionshipCalendarsService],
})
export class ChampionshipCalendarsModule {}
