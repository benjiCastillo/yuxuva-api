import { Module } from '@nestjs/common';
import { FederationsService } from './federations.service';
import { FederationsController } from './federations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [FederationsController],
  providers: [FederationsService],
   imports: [PrismaModule],
})
export class FederationsModule {}
