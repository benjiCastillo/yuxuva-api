import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';

@Module({
  imports: [PrismaModule],
  controllers: [DriversController],
  providers: [DriversService],
})
export class DriversModule {}
