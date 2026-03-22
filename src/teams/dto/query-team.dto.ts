import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { GetPaginationParamsDto } from 'src/common/dto/get-pagination-params.dto';

export class QueryTeamDto extends GetPaginationParamsDto {
  @ApiPropertyOptional({ description: 'Filter by championship id' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  championshipId?: string;

  @ApiPropertyOptional({ description: 'Filter by category id' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by rally stage id for select-data use cases' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  stageId?: string;

  @ApiPropertyOptional({
    description:
      'Only for select-data with stageId + categoryId. When true, excludes teams already scheduled in that stage.',
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (value === true || value === 'true' || value === '1' || value === 1)
      return true;
    if (value === false || value === 'false' || value === '0' || value === 0)
      return false;
    return value;
  })
  @IsOptional()
  @IsBoolean()
  excludeScheduledForStage?: boolean;

  @ApiPropertyOptional({ description: 'Filter by car brand' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  carBrand?: string;

  @ApiPropertyOptional({ description: 'Filter by car model' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  carModel?: string;

  @ApiPropertyOptional({ description: 'Filter by car year' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value);
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  carYear?: number;

  @ApiPropertyOptional({ description: 'Filter by driver id' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @ApiPropertyOptional({ description: 'Filter by codriver id' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  codriverId?: string;

  @ApiPropertyOptional({ description: 'Filter by competition number' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value);
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  competitionNo?: number;

  @ApiPropertyOptional({ description: 'Filter by team status' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim().toUpperCase();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;
}
