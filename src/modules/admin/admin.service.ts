import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
  ) {}

  async verifyCompany(companyId: string, status: string): Promise<CompanyDocument> {
    const company = await this.companyModel
      .findByIdAndUpdate(
        companyId,
        { verificationStatus: status },
        { new: true },
      )
      .populate('createdBy', 'username email')
      .exec();
    if (!company) {
      throw new NotFoundException(`Company with id "${companyId}" not found`);
    }
    return company;
  }

  async moderateJob(jobId: string, status: string): Promise<JobDocument> {
    const job = await this.jobModel
      .findByIdAndUpdate(jobId, { moderationStatus: status }, { new: true })
      .populate('companyId')
      .populate('createdBy', 'username email')
      .exec();
    if (!job) {
      throw new NotFoundException(`Job with id "${jobId}" not found`);
    }
    return job;
  }

  async banUser(userId: string, banned: boolean): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { isBanned: banned }, { new: true })
      .select('-password')
      .populate('role')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }
    return user;
  }

  async getPendingJobs(): Promise<JobDocument[]> {
    return this.jobModel
      .find({ moderationStatus: 'PENDING_APPROVAL' })
      .populate('companyId')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPendingCompanies(): Promise<CompanyDocument[]> {
    return this.companyModel
      .find({ verificationStatus: 'pending' })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }
}
