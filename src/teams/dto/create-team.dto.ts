import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTeamDto {
  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  championshipId: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  categoryId: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  driverId: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsUUID()
  codriverId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  competitionNo: number;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  carBrand: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  carModel?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1900)
  carYear?: number;

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
