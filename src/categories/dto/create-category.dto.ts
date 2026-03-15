import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { CATEGORY_MODALITIES } from '../constants/category.constants';

function toBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return value;
}

export class CreateCategoryDto {
  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Transform(({ value }) =>
    String(value ?? '')
      .trim()
      .toUpperCase(),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @IsIn(CATEGORY_MODALITIES)
  modality: string;

  @Transform(({ value }) => toBoolean(value))
  @IsOptional()
  @IsBoolean()
  allowsCodriver?: boolean;

  @Transform(({ value }) => toBoolean(value))
  @IsOptional()
  @IsBoolean()
  pointsApply?: boolean;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  championshipId: string;
}
