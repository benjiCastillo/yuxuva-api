import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CarCategoriesController } from './car-categories.controller';
import { CarCategoriesService } from './car-categories.service';

@Module({
  imports: [PrismaModule],
  controllers: [CarCategoriesController],
  providers: [CarCategoriesService],
})
export class CarCategoriesModule {}
