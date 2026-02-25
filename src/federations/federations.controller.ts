import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FederationsService } from './federations.service';
import { CreateFederationDto } from './dto/create-federation.dto';
import { UpdateFederationDto } from './dto/update-federation.dto';

@Controller('federations')
export class FederationsController {
  constructor(private readonly federationsService: FederationsService) {}

  @Post()
  create(@Body() createFederationDto: CreateFederationDto) {
    return this.federationsService.create(createFederationDto);
  }

  @Get()
  findAll() {
    return this.federationsService.findAll();
  }

  @Get('select-data')
  async selectData() {
    return await this.federationsService.selectData();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.federationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFederationDto: UpdateFederationDto,
  ) {
    return this.federationsService.update(id, updateFederationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.federationsService.remove(id);
  }
}
