import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRallyStageScheduleDto {
  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  stageId: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  categoryId: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  teamId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  startOrder: number;

  @IsOptional()
  @IsDateString()
  scheduledStartTime?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim().toUpperCase();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  status?: string;
}
