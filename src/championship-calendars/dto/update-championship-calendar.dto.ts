import { PartialType } from '@nestjs/mapped-types';
import { CreateChampionshipCalendarDto } from './create-championship-calendar.dto';

export class UpdateChampionshipCalendarDto extends PartialType(
  CreateChampionshipCalendarDto,
) {}
