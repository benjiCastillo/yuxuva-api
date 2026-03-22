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
import { CreateRallyStageResultDto } from './dto/create-rally-stage-result.dto';
import { QueryRallyStageResultDto } from './dto/query-rally-stage-result.dto';
import { UpdateRallyStageResultDto } from './dto/update-rally-stage-result.dto';
import { RallyStageResultsService } from './rally-stage-results.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rally-stage-results')
export class RallyStageResultsController {
  constructor(
    private readonly rallyStageResultsService: RallyStageResultsService,
  ) {}

  @Roles('ADMIN')
  @Post()
  create(
    @Body() createRallyStageResultDto: CreateRallyStageResultDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.rallyStageResultsService.create(
      createRallyStageResultDto,
      user.id,
    );
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Query() queryRallyStageResultDto: QueryRallyStageResultDto) {
    return this.rallyStageResultsService.findAll(queryRallyStageResultDto);
  }

  @Roles('ADMIN')
  @Get('select-data')
  selectData() {
    return this.rallyStageResultsService.selectData();
  }

  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rallyStageResultsService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRallyStageResultDto: UpdateRallyStageResultDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.rallyStageResultsService.update(
      id,
      updateRallyStageResultDto,
      user.id,
    );
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rallyStageResultsService.remove(id);
  }
}
