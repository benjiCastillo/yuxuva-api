import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RallyStageSchedulesController } from './rally-stage-schedules.controller';
import { RallyStageSchedulesService } from './rally-stage-schedules.service';

@Module({
  imports: [PrismaModule],
  controllers: [RallyStageSchedulesController],
  providers: [RallyStageSchedulesService],
})
export class RallyStageSchedulesModule {}
