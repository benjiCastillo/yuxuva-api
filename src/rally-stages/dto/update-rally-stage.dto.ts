import { PartialType } from '@nestjs/mapped-types';
import { CreateRallyStageDto } from './create-rally-stage.dto';

export class UpdateRallyStageDto extends PartialType(CreateRallyStageDto) {}
