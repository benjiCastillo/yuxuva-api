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
import { DepartmentAssociationsService } from './department-associations.service';
import { CreateDepartmentAssociationDto } from './dto/create-department-association.dto';
import { QueryDepartmentAssociationDto } from './dto/query-department-association.dto';
import { UpdateDepartmentAssociationDto } from './dto/update-department-association.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('department-associations')
export class DepartmentAssociationsController {
  constructor(
    private readonly departmentAssociationsService: DepartmentAssociationsService,
  ) {}

  @Roles('ADMIN')
  @Post()
  create(
    @Body() createDepartmentAssociationDto: CreateDepartmentAssociationDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.departmentAssociationsService.create(
      createDepartmentAssociationDto,
      user.id,
    );
  }

  @Roles('ADMIN')
  @Get()
  findAll(
    @Query() queryDepartmentAssociationDto: QueryDepartmentAssociationDto,
  ) {
    return this.departmentAssociationsService.findAll(
      queryDepartmentAssociationDto,
    );
  }

  @Roles('ADMIN')
  @Get('select-data')
  selectData() {
    return this.departmentAssociationsService.selectData();
  }

  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentAssociationsService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDepartmentAssociationDto: UpdateDepartmentAssociationDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.departmentAssociationsService.update(
      id,
      updateDepartmentAssociationDto,
      user.id,
    );
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentAssociationsService.remove(id);
  }
}
