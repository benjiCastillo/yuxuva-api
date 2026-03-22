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

export class CreateRallyStageResultDto {
  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  stageId: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  teamId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  penalty?: number;

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
