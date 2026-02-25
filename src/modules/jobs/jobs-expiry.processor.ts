import { Processor, Process } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';

@Processor('job-expiry')
export class JobsExpiryProcessor {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
  ) {}

  @Process('close-expired')
  async handleCloseExpired() {
    const result = await this.jobModel
      .updateMany(
        {
          status: 'OPEN',
          expiryDate: { $lt: new Date(), $ne: null },
        },
        { $set: { status: 'CLOSED' } },
      )
      .exec();
    return { modifiedCount: result.modifiedCount };
  }
}
