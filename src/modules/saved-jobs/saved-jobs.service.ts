import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavedJob, SavedJobDocument } from './schemas/saved-job.schema';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class SavedJobsService {
  constructor(
    @InjectModel(SavedJob.name) private savedJobModel: Model<SavedJobDocument>,
    private jobsService: JobsService,
  ) {}

  async save(userId: string, jobId: string): Promise<SavedJobDocument> {
    await this.jobsService.findOne(jobId);
    const existing = await this.savedJobModel
      .findOne({ userId, jobId })
      .exec();
    if (existing) {
      throw new ConflictException('Job already saved');
    }
    const saved = new this.savedJobModel({ userId, jobId });
    return saved.save();
  }

  async findByUser(userId: string): Promise<SavedJobDocument[]> {
    return this.savedJobModel
      .find({ userId })
      .populate('jobId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async remove(userId: string, jobId: string): Promise<void> {
    const result = await this.savedJobModel
      .findOneAndDelete({ userId, jobId })
      .exec();
    if (!result) {
      throw new NotFoundException('Saved job not found');
    }
  }

  async isSaved(userId: string, jobId: string): Promise<boolean> {
    const saved = await this.savedJobModel.findOne({ userId, jobId }).exec();
    return !!saved;
  }
}
