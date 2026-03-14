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
import { ChampionshipCalendarsService } from './championship-calendars.service';
import { CreateChampionshipCalendarDto } from './dto/create-championship-calendar.dto';
import { QueryChampionshipCalendarDto } from './dto/query-championship-calendar.dto';
import { UpdateChampionshipCalendarDto } from './dto/update-championship-calendar.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('championship-calendars')
export class ChampionshipCalendarsController {
  constructor(
    private readonly championshipCalendarsService: ChampionshipCalendarsService,
  ) {}

  @Roles('ADMIN')
  @Post()
  create(
    @Body() createChampionshipCalendarDto: CreateChampionshipCalendarDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.championshipCalendarsService.create(
      createChampionshipCalendarDto,
      user.id,
    );
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Query() queryChampionshipCalendarDto: QueryChampionshipCalendarDto) {
    return this.championshipCalendarsService.findAll(
      queryChampionshipCalendarDto,
    );
  }

  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.championshipCalendarsService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChampionshipCalendarDto: UpdateChampionshipCalendarDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.championshipCalendarsService.update(
      id,
      updateChampionshipCalendarDto,
      user.id,
    );
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.championshipCalendarsService.remove(id);
  }
}
