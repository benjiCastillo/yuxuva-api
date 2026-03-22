import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { RALLY_STAGE_TYPES } from '../constants/rally-stage.constants';

export class CreateRallyStageDto {
  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  rallyId: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @Transform(({ value }) => String(value ?? '').trim().toUpperCase())
  @IsString()
  @IsIn(RALLY_STAGE_TYPES)
  stageType: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  stageOrder: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  distanceKm: number;
}
