import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { GetPaginationParamsDto } from 'src/common/dto/get-pagination-params.dto';
import { CATEGORY_MODALITIES } from '../constants/category.constants';

function toBoolean(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return value;
}

export class QueryCategoryDto extends GetPaginationParamsDto {
  @ApiPropertyOptional({ description: 'Search by category name' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by category modality' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim().toUpperCase();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(CATEGORY_MODALITIES)
  modality?: string;

  @ApiPropertyOptional({ description: 'Filter by allows codriver' })
  @Transform(({ value }) => toBoolean(value))
  @IsOptional()
  @IsBoolean()
  allowsCodriver?: boolean;

  @ApiPropertyOptional({ description: 'Filter by points apply' })
  @Transform(({ value }) => toBoolean(value))
  @IsOptional()
  @IsBoolean()
  pointsApply?: boolean;

  @ApiPropertyOptional({ description: 'Filter by championship id' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  championshipId?: string;
}
