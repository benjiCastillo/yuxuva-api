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
import { CreateDriverDto } from './dto/create-driver.dto';
import { QueryDriverDto } from './dto/query-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriversService } from './drivers.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Roles('ADMIN')
  @Post()
  create(
    @Body() createDriverDto: CreateDriverDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.driversService.create(createDriverDto, user.id);
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Query() queryDriverDto: QueryDriverDto) {
    return this.driversService.findAll(queryDriverDto);
  }

  @Roles('ADMIN')
  @Get('select-data')
  selectData() {
    return this.driversService.selectData();
  }

  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDriverDto: UpdateDriverDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.driversService.update(id, updateDriverDto, user.id);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }
}
