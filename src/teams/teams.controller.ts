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
import { CreateTeamDto } from './dto/create-team.dto';
import { QueryTeamDto } from './dto/query-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Roles('ADMIN')
  @Post()
  create(
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.teamsService.create(createTeamDto, user.id);
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Query() queryTeamDto: QueryTeamDto) {
    return this.teamsService.findAll(queryTeamDto);
  }

  @Roles('ADMIN')
  @Get('select-data')
  selectData(@Query() queryTeamDto: QueryTeamDto) {
    return this.teamsService.selectData(queryTeamDto);
  }

  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.teamsService.update(id, updateTeamDto, user.id);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }
}
