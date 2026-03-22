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
import { CreateRallyStageDto } from './dto/create-rally-stage.dto';
import { QueryRallyStageDto } from './dto/query-rally-stage.dto';
import { UpdateRallyStageDto } from './dto/update-rally-stage.dto';
import { RallyStagesService } from './rally-stages.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rally-stages')
export class RallyStagesController {
  constructor(private readonly rallyStagesService: RallyStagesService) {}

  @Roles('ADMIN')
  @Post()
  create(
    @Body() createRallyStageDto: CreateRallyStageDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.rallyStagesService.create(createRallyStageDto, user.id);
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Query() queryRallyStageDto: QueryRallyStageDto) {
    return this.rallyStagesService.findAll(queryRallyStageDto);
  }

  @Roles('ADMIN')
  @Get('select-data')
  selectData() {
    return this.rallyStagesService.selectData();
  }

  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rallyStagesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRallyStageDto: UpdateRallyStageDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.rallyStagesService.update(id, updateRallyStageDto, user.id);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rallyStagesService.remove(id);
  }
}
