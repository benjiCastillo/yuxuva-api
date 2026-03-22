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
import { CreateRallyStageScheduleDto } from './dto/create-rally-stage-schedule.dto';
import { QueryRallyStageScheduleDto } from './dto/query-rally-stage-schedule.dto';
import { UpdateRallyStageScheduleDto } from './dto/update-rally-stage-schedule.dto';
import { RallyStageSchedulesService } from './rally-stage-schedules.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rally-stage-schedules')
export class RallyStageSchedulesController {
  constructor(
    private readonly rallyStageSchedulesService: RallyStageSchedulesService,
  ) {}

  @Roles('ADMIN')
  @Post()
  create(
    @Body() createRallyStageScheduleDto: CreateRallyStageScheduleDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.rallyStageSchedulesService.create(
      createRallyStageScheduleDto,
      user.id,
    );
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Query() queryRallyStageScheduleDto: QueryRallyStageScheduleDto) {
    return this.rallyStageSchedulesService.findAll(queryRallyStageScheduleDto);
  }

  @Roles('ADMIN')
  @Get('select-data')
  selectData() {
    return this.rallyStageSchedulesService.selectData();
  }

  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rallyStageSchedulesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRallyStageScheduleDto: UpdateRallyStageScheduleDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.rallyStageSchedulesService.update(
      id,
      updateRallyStageScheduleDto,
      user.id,
    );
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rallyStageSchedulesService.remove(id);
  }
}
