import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  JobSeekerProfile,
  JobSeekerProfileDocument,
} from './schemas/job-seeker-profile.schema';
import { CreateJobSeekerProfileDto } from './dto/create-job-seeker-profile.dto';
import { UpdateJobSeekerProfileDto } from './dto/update-job-seeker-profile.dto';

@Injectable()
export class JobSeekerProfilesService {
  constructor(
    @InjectModel(JobSeekerProfile.name)
    private profileModel: Model<JobSeekerProfileDocument>,
  ) {}

  async create(
    createDto: CreateJobSeekerProfileDto,
    userId: string,
  ): Promise<JobSeekerProfileDocument> {
    const existing = await this.profileModel.findOne({ userId }).exec();
    if (existing) {
      throw new ForbiddenException('Profile already exists for this user');
    }
    const profile = new this.profileModel({ ...createDto, userId });
    return profile.save();
  }

  async findOne(id: string): Promise<JobSeekerProfileDocument> {
    const profile = await this.profileModel
      .findById(id)
      .populate('userId', 'username email')
      .exec();
    if (!profile) {
      throw new NotFoundException(`Profile with id "${id}" not found`);
    }
    return profile;
  }

  async findByUserId(userId: string): Promise<JobSeekerProfileDocument | null> {
    return this.profileModel
      .findOne({ userId })
      .populate('userId', 'username email')
      .exec();
  }

  async findMyProfile(userId: string): Promise<JobSeekerProfileDocument | null> {
    return this.findByUserId(userId);
  }

  async update(
    id: string,
    updateDto: UpdateJobSeekerProfileDto,
    userId: string,
  ): Promise<JobSeekerProfileDocument> {
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) {
      throw new NotFoundException(`Profile with id "${id}" not found`);
    }
    if (profile.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    const updated = await this.profileModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('userId', 'username email')
      .exec();
    if (!updated) throw new NotFoundException(`Profile with id "${id}" not found`);
    return updated;
  }

  async updateByUserId(
    userId: string,
    updateDto: UpdateJobSeekerProfileDto,
  ): Promise<JobSeekerProfileDocument> {
    const profile = await this.profileModel
      .findOneAndUpdate({ userId }, updateDto, { new: true, upsert: true })
      .populate('userId', 'username email')
      .exec();
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async remove(id: string, userId: string): Promise<void> {
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) {
      throw new NotFoundException(`Profile with id "${id}" not found`);
    }
    if (profile.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own profile');
    }
    await this.profileModel.findByIdAndDelete(id).exec();
  }
}
