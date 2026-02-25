import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { Job, JobSchema } from './schemas/job.schema';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobsExpiryProcessor } from './jobs-expiry.processor';
import { JobsExpiryService } from './jobs-expiry.service';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    BullModule.registerQueue({ name: 'job-expiry' }),
    CompaniesModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, JobsExpiryProcessor, JobsExpiryService],
  exports: [JobsService],
})
export class JobsModule {}
