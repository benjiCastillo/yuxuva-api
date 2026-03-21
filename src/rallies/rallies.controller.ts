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
import { CreateRallyDto } from './dto/create-rally.dto';
import { QueryRallyDto } from './dto/query-rally.dto';
import { UpdateRallyDto } from './dto/update-rally.dto';
import { RalliesService } from './rallies.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rallies')
export class RalliesController {
  constructor(private readonly ralliesService: RalliesService) {}

  @Roles('ADMIN')
  @Post()
  create(
    @Body() createRallyDto: CreateRallyDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.ralliesService.create(createRallyDto, user.id);
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Query() queryRallyDto: QueryRallyDto) {
    return this.ralliesService.findAll(queryRallyDto);
  }

  @Roles('ADMIN')
  @Get('select-data')
  selectData() {
    return this.ralliesService.selectData();
  }

  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ralliesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRallyDto: UpdateRallyDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.ralliesService.update(id, updateRallyDto, user.id);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ralliesService.remove(id);
  }
}
