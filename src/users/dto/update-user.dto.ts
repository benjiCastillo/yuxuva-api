import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  status?: string;
}
