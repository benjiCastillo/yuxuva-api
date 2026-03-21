import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RalliesController } from './rallies.controller';
import { RalliesService } from './rallies.service';

@Module({
  imports: [PrismaModule],
  controllers: [RalliesController],
  providers: [RalliesService],
})
export class RalliesModule {}
