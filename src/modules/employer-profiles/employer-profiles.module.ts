import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmployerProfile,
  EmployerProfileSchema,
} from './schemas/employer-profile.schema';
import { EmployerProfilesService } from './employer-profiles.service';
import { EmployerProfilesController } from './employer-profiles.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmployerProfile.name, schema: EmployerProfileSchema },
    ]),
  ],
  controllers: [EmployerProfilesController],
  providers: [EmployerProfilesService],
  exports: [EmployerProfilesService],
})
export class EmployerProfilesModule {}
