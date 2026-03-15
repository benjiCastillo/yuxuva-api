import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { CurrentUser as CurrentUserType } from '../auth/interfaces/current-user.interface';
import { CarCategoriesService } from './car-categories.service';
import { CreateCarCategoryDto } from './dto/create-car-category.dto';
import { QueryCarCategoryDto } from './dto/query-car-category.dto';
import { UpdateCarCategoryDto } from './dto/update-car-category.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('car-categories')
export class CarCategoriesController {
  constructor(private readonly carCategoriesService: CarCategoriesService) {}

  @Roles('ADMIN')
  @Post()
  create(
    @Body() createCarCategoryDto: CreateCarCategoryDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.carCategoriesService.create(createCarCategoryDto, user.id);
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Query() queryCarCategoryDto: QueryCarCategoryDto) {
    return this.carCategoriesService.findAll(queryCarCategoryDto);
  }

  @Roles('ADMIN')
  @Get('select-data')
  selectData() {
    return this.carCategoriesService.selectData();
  }

  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carCategoriesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCarCategoryDto: UpdateCarCategoryDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.carCategoriesService.update(id, updateCarCategoryDto, user.id);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carCategoriesService.remove(id);
  }
}
