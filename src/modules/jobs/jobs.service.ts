import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument, JobStatus } from './schemas/job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private companiesService: CompaniesService,
  ) {}

  async create(createJobDto: CreateJobDto, userId: string): Promise<JobDocument> {
    const company = await this.companiesService.findOne(createJobDto.companyId);
    if (company.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only create jobs for your own company');
    }
    const job = new this.jobModel({
      ...createJobDto,
      createdBy: userId,
      expiryDate: createJobDto.expiryDate
        ? new Date(createJobDto.expiryDate)
        : undefined,
    });
    return job.save();
  }

  async findAll(): Promise<JobDocument[]> {
    return this.jobModel
      .find({ status: 'OPEN' })
      .populate('companyId')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<JobDocument> {
    const job = await this.jobModel
      .findById(id)
      .populate('companyId')
      .populate('createdBy', 'username email')
      .exec();
    if (!job) {
      throw new NotFoundException(`Job with id "${id}" not found`);
    }
    return job;
  }

  async findByCompany(companyId: string): Promise<JobDocument[]> {
    return this.jobModel
      .find({ companyId })
      .populate('companyId')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCreatedBy(userId: string): Promise<JobDocument[]> {
    return this.jobModel
      .find({ createdBy: userId })
      .populate('companyId')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async search(
    searchDto: SearchJobsDto,
  ): Promise<{ jobs: JobDocument[]; total: number; page: number; limit: number }> {
    const page = searchDto.page ?? 1;
    const limit = searchDto.limit ?? 10;
    const skip = (page - 1) * limit;

    const andConditions: Record<string, unknown>[] = [{ status: 'OPEN' }];

    if (searchDto.skills?.length) {
      andConditions.push({ requiredSkills: { $in: searchDto.skills } });
    }
    if (searchDto.location) {
      andConditions.push({ location: new RegExp(searchDto.location, 'i') });
    }
    if (searchDto.salaryMin != null) {
      andConditions.push({
        $or: [
          { salaryMax: { $gte: searchDto.salaryMin } },
          { salaryMax: null },
        ],
      });
    }
    if (searchDto.salaryMax != null) {
      andConditions.push({ salaryMin: { $lte: searchDto.salaryMax } });
    }
    if (searchDto.experienceLevel) {
      andConditions.push({ experienceLevel: searchDto.experienceLevel });
    }
    if (searchDto.employmentType) {
      andConditions.push({ employmentType: searchDto.employmentType });
    }
    if (searchDto.search) {
      andConditions.push({
        $or: [
          { title: new RegExp(searchDto.search, 'i') },
          { description: new RegExp(searchDto.search, 'i') },
        ],
      });
    }

    const filter = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const [jobs, total] = await Promise.all([
      this.jobModel
        .find(filter)
        .populate('companyId')
        .populate('createdBy', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.jobModel.countDocuments(filter).exec(),
    ]);

    return { jobs, total, page, limit };
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    userId: string,
  ): Promise<JobDocument> {
    const job = await this.jobModel.findById(id).exec();
    if (!job) {
      throw new NotFoundException(`Job with id "${id}" not found`);
    }
    if (job.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only update your own jobs');
    }
    const updateData = { ...updateJobDto };
    if (updateJobDto.expiryDate) {
      updateData.expiryDate = new Date(updateJobDto.expiryDate) as any;
    }
    const updated = await this.jobModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('companyId')
      .populate('createdBy', 'username email')
      .exec();
    if (!updated) throw new NotFoundException(`Job with id "${id}" not found`);
    return updated;
  }

  async updateStatus(
    id: string,
    status: JobStatus,
    userId: string,
  ): Promise<JobDocument> {
    return this.update(id, { status } as UpdateJobDto, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const job = await this.jobModel.findById(id).exec();
    if (!job) {
      throw new NotFoundException(`Job with id "${id}" not found`);
    }
    if (job.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own jobs');
    }
    await this.jobModel.findByIdAndDelete(id).exec();
  }
}
