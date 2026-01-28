import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ChampionshipsService } from './championships.service';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';
import { QueryChampionshipDto } from './dto/query-championship.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../auth/interfaces/current-user.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('championships')
export class ChampionshipsController {
  constructor(private readonly championshipsService: ChampionshipsService) {}

  @Roles('ADMIN')
  @Post()
  create(
    @Body() createChampionshipDto: CreateChampionshipDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    console.log(user);
    return this.championshipsService.create(createChampionshipDto, user.id);
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Query() queryChampionshipDto: QueryChampionshipDto) {
    return this.championshipsService.findAll(queryChampionshipDto);
  }

  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.championshipsService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChampionshipDto: UpdateChampionshipDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    console.log(user);
    return this.championshipsService.update(id, updateChampionshipDto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.championshipsService.remove(+id);
  }
}
