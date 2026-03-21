import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateRallyDto {
  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  calendarId: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalKm?: number;
}
