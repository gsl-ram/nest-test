import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  JobSeekerProfile,
  JobSeekerProfileSchema,
} from './schemas/job-seeker-profile.schema';
import { JobSeekerProfilesService } from './job-seeker-profiles.service';
import { JobSeekerProfilesController } from './job-seeker-profiles.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobSeekerProfile.name, schema: JobSeekerProfileSchema },
    ]),
  ],
  controllers: [JobSeekerProfilesController],
  providers: [JobSeekerProfilesService],
  exports: [JobSeekerProfilesService],
})
export class JobSeekerProfilesModule {}
