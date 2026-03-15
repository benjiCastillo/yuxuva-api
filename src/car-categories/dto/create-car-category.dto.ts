import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateCarCategoryDto {
  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  carId: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  categoryId: string;

  @IsDateString()
  validFrom: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return String(value).trim();
  })
  @IsOptional()
  @IsDateString()
  validTo?: string;
}
