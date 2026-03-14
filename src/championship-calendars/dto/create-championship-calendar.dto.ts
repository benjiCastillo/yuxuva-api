import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { CHAMPIONSHIP_CALENDAR_STATUSES } from '../constants/championship-calendar.constants';

export class CreateChampionshipCalendarDto {
  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  championshipId: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  associationId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  roundNumber: number;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  eventName: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

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
}
