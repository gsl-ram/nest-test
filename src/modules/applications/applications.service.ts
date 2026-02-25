import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Application,
  ApplicationDocument,
  ApplicationStatus,
} from './schemas/application.schema';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JobsService } from '../jobs/jobs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    private jobsService: JobsService,
    private notificationsService: NotificationsService,
    private activityLogsService: ActivityLogsService,
  ) {}

  async create(
    createDto: CreateApplicationDto,
    seekerId: string,
  ): Promise<ApplicationDocument> {
    const job = await this.jobsService.findOne(createDto.jobId);
    if (job.status !== 'OPEN') {
      throw new ForbiddenException('Cannot apply to a closed or draft job');
    }

    const existing = await this.applicationModel
      .findOne({ jobId: createDto.jobId, seekerId })
      .exec();
    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    const application = new this.applicationModel({
      ...createDto,
      seekerId,
    });
    const saved = await application.save();
    await this.notificationsService.create(
      job.createdBy.toString(),
      'job_application_submitted',
      'New job application',
      `A candidate has applied for "${job.title}"`,
      saved._id.toString(),
    );
    await this.activityLogsService.log(seekerId, 'apply', 'job', {
      jobId: createDto.jobId,
      applicationId: saved._id.toString(),
    });
    return saved;
  }

  async findOne(id: string): Promise<ApplicationDocument> {
    const application = await this.applicationModel
      .findById(id)
      .populate('jobId')
      .populate('seekerId', 'username email')
      .exec();
    if (!application) {
      throw new NotFoundException(`Application with id "${id}" not found`);
    }
    return application;
  }

  async findBySeeker(seekerId: string): Promise<ApplicationDocument[]> {
    return this.applicationModel
      .find({ seekerId })
      .populate('jobId')
      .populate('seekerId', 'username email')
      .sort({ appliedAt: -1 })
      .exec();
  }

  async findByJob(jobId: string, userId?: string): Promise<ApplicationDocument[]> {
    const job = await this.jobsService.findOne(jobId);
    if (userId && job.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only view applications for your own jobs');
    }
    return this.applicationModel
      .find({ jobId })
      .populate('jobId')
      .populate('seekerId', 'username email')
      .sort({ appliedAt: -1 })
      .exec();
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus,
    userId: string,
  ): Promise<ApplicationDocument> {
    const application = await this.applicationModel
      .findById(id)
      .populate('jobId')
      .exec();
    if (!application) {
      throw new NotFoundException(`Application with id "${id}" not found`);
    }
    const job = application.jobId as any;
    if (job.createdBy.toString() !== userId) {
      throw new ForbiddenException(
        'You can only update applications for your own jobs',
      );
    }
    const updated = await this.applicationModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('jobId')
      .populate('seekerId', 'username email')
      .exec();
    if (!updated) throw new NotFoundException(`Application with id "${id}" not found`);
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const application = await this.applicationModel
      .findById(id)
      .populate('jobId')
      .exec();
    if (!application) {
      throw new NotFoundException(`Application with id "${id}" not found`);
    }
    const job = application.jobId as any;
    if (job.createdBy.toString() !== userId && application.seekerId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own applications');
    }
    await this.applicationModel.findByIdAndDelete(id).exec();
  }
}
