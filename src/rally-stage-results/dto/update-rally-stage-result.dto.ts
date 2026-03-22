import { PartialType } from '@nestjs/mapped-types';
import { CreateRallyStageResultDto } from './create-rally-stage-result.dto';

export class UpdateRallyStageResultDto extends PartialType(
  CreateRallyStageResultDto,
) {}
