import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { DEPARTMENT_ASSOCIATION_STATUSES } from '../constants/department-association.constants';

export class CreateDepartmentAssociationDto {
  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  department: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim().toUpperCase();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(DEPARTMENT_ASSOCIATION_STATUSES)
  status?: string;

  @Transform(({ value }) => String(value ?? '').trim())
  @IsUUID()
  federationId: string;
}
