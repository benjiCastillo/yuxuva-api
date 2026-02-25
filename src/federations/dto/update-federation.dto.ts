import { PartialType } from '@nestjs/swagger';
import { CreateFederationDto } from './create-federation.dto';

export class UpdateFederationDto extends PartialType(CreateFederationDto) {}
