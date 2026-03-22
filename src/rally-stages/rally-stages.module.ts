import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RallyStagesController } from './rally-stages.controller';
import { RallyStagesService } from './rally-stages.service';

@Module({
  imports: [PrismaModule],
  controllers: [RallyStagesController],
  providers: [RallyStagesService],
})
export class RallyStagesModule {}
