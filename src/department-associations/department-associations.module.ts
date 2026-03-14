import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DepartmentAssociationsController } from './department-associations.controller';
import { DepartmentAssociationsService } from './department-associations.service';

@Module({
  imports: [PrismaModule],
  controllers: [DepartmentAssociationsController],
  providers: [DepartmentAssociationsService],
})
export class DepartmentAssociationsModule {}
