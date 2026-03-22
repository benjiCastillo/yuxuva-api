import { PartialType } from '@nestjs/mapped-types';
import { CreateRallyStageScheduleDto } from './create-rally-stage-schedule.dto';

export class UpdateRallyStageScheduleDto extends PartialType(
  CreateRallyStageScheduleDto,
) {}
