import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentAssociationDto } from './create-department-association.dto';

export class UpdateDepartmentAssociationDto extends PartialType(
  CreateDepartmentAssociationDto,
) {}
