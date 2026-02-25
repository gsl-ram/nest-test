import { PartialType } from '@nestjs/mapped-types';
import { CreateJobSeekerProfileDto } from './create-job-seeker-profile.dto';

export class UpdateJobSeekerProfileDto extends PartialType(
  CreateJobSeekerProfileDto,
) {}
