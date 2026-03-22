import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RallyStageResultsController } from './rally-stage-results.controller';
import { RallyStageResultsService } from './rally-stage-results.service';

@Module({
  imports: [PrismaModule],
  controllers: [RallyStageResultsController],
  providers: [RallyStageResultsService],
})
export class RallyStageResultsModule {}
