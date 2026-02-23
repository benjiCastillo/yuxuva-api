import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CHAMPIONSHIP_MODALITIES,
  CHAMPIONSHIP_STATUSES,
} from '../constants/championship.constants';

export class CreateChampionshipDto {
  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @Transform(({ value }) =>
    String(value ?? '')
      .trim()
      .toUpperCase(),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @IsIn(CHAMPIONSHIP_MODALITIES)
  modality: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  season: number;

  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim().toUpperCase();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(CHAMPIONSHIP_STATUSES)
  status?: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  federationId: string;
}
