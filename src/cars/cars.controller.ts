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
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { QueryCarDto } from './dto/query-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Roles('ADMIN')
  @Post()
  create(
    @Body() createCarDto: CreateCarDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.carsService.create(createCarDto, user.id);
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Query() queryCarDto: QueryCarDto) {
    return this.carsService.findAll(queryCarDto);
  }

  @Roles('ADMIN')
  @Get('select-data')
  selectData() {
    return this.carsService.selectData();
  }

  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCarDto: UpdateCarDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.carsService.update(id, updateCarDto, user.id);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carsService.remove(id);
  }
}
