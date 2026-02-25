import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployerProfileDto } from './create-employer-profile.dto';

export class UpdateEmployerProfileDto extends PartialType(
  CreateEmployerProfileDto,
) {}
