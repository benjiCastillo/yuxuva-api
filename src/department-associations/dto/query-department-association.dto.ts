import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { GetPaginationParamsDto } from 'src/common/dto/get-pagination-params.dto';
import { DEPARTMENT_ASSOCIATION_STATUSES } from '../constants/department-association.constants';

export class QueryDepartmentAssociationDto extends GetPaginationParamsDto {
  @ApiPropertyOptional({ description: 'Search by association name' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by department' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ description: 'Filter by association status' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim().toUpperCase();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(DEPARTMENT_ASSOCIATION_STATUSES)
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by federation id' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  federationId?: string;
}
