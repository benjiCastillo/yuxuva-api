import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { GetPaginationParamsDto } from 'src/common/dto/get-pagination-params.dto';

export class QueryCarCategoryDto extends GetPaginationParamsDto {
  @ApiPropertyOptional({ description: 'Filter by car id' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  carId?: string;

  @ApiPropertyOptional({ description: 'Filter by category id' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by validFrom from date' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return String(value).trim();
  })
  @IsOptional()
  @IsDateString()
  validFromFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by validFrom to date' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return String(value).trim();
  })
  @IsOptional()
  @IsDateString()
  validFromTo?: string;

  @ApiPropertyOptional({ description: 'Filter by validTo from date' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return String(value).trim();
  })
  @IsOptional()
  @IsDateString()
  validToFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by validTo to date' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return String(value).trim();
  })
  @IsOptional()
  @IsDateString()
  validToTo?: string;
}
