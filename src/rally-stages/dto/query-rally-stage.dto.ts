import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { GetPaginationParamsDto } from 'src/common/dto/get-pagination-params.dto';
import { RALLY_STAGE_TYPES } from '../constants/rally-stage.constants';

export class QueryRallyStageDto extends GetPaginationParamsDto {
  @ApiPropertyOptional({ description: 'Filter by rally id' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  rallyId?: string;

  @ApiPropertyOptional({ description: 'Filter by championship calendar id' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  calendarId?: string;

  @ApiPropertyOptional({ description: 'Filter by championship id' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  championshipId?: string;

  @ApiPropertyOptional({ description: 'Filter by association id' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  associationId?: string;

  @ApiPropertyOptional({ description: 'Search by stage name' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by stage type' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim().toUpperCase();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @IsIn(RALLY_STAGE_TYPES)
  stageType?: string;

  @ApiPropertyOptional({ description: 'Filter by stage order' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value);
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  stageOrder?: number;

  @ApiPropertyOptional({ description: 'Filter by minimum distance in kilometers' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value);
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKmFrom?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum distance in kilometers' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value);
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKmTo?: number;
}
