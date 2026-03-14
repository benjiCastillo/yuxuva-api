import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { GetPaginationParamsDto } from 'src/common/dto/get-pagination-params.dto';
import { CHAMPIONSHIP_CALENDAR_STATUSES } from '../constants/championship-calendar.constants';

export class QueryChampionshipCalendarDto extends GetPaginationParamsDto {
  @ApiPropertyOptional({ description: 'Search by event name' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  eventName?: string;

  @ApiPropertyOptional({ description: 'Filter by round number' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value);
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  roundNumber?: number;

  @ApiPropertyOptional({ description: 'Filter by calendar status' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim().toUpperCase();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(CHAMPIONSHIP_CALENDAR_STATUSES)
  status?: string;

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

  @ApiPropertyOptional({ description: 'Filter by start date from' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return String(value).trim();
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by end date to' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return String(value).trim();
  })
  @IsOptional()
  @IsDateString()
  endDateTo?: string;
}
