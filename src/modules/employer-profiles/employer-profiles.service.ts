import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmployerProfile,
  EmployerProfileDocument,
} from './schemas/employer-profile.schema';
import { CreateEmployerProfileDto } from './dto/create-employer-profile.dto';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';

@Injectable()
export class EmployerProfilesService {
  constructor(
    @InjectModel(EmployerProfile.name)
    private profileModel: Model<EmployerProfileDocument>,
  ) {}

  async create(
    createDto: CreateEmployerProfileDto,
    userId: string,
  ): Promise<EmployerProfileDocument> {
    const existing = await this.profileModel.findOne({ userId }).exec();
    if (existing) {
      throw new ForbiddenException('Profile already exists for this user');
    }
    const profile = new this.profileModel({ ...createDto, userId });
    return profile.save();
  }

  async findOne(id: string): Promise<EmployerProfileDocument> {
    const profile = await this.profileModel
      .findById(id)
      .populate('userId', 'username email')
      .populate('companyId')
      .exec();
    if (!profile) {
      throw new NotFoundException(`Profile with id "${id}" not found`);
    }
    return profile;
  }

  async findByUserId(userId: string): Promise<EmployerProfileDocument | null> {
    return this.profileModel
      .findOne({ userId })
      .populate('userId', 'username email')
      .populate('companyId')
      .exec();
  }

  async findMyProfile(userId: string): Promise<EmployerProfileDocument | null> {
    return this.findByUserId(userId);
  }

  async update(
    id: string,
    updateDto: UpdateEmployerProfileDto,
    userId: string,
  ): Promise<EmployerProfileDocument> {
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
      .populate('companyId')
      .exec();
    if (!updated) throw new NotFoundException(`Profile with id "${id}" not found`);
    return updated;
  }

  async updateByUserId(
    userId: string,
    updateDto: UpdateEmployerProfileDto,
  ): Promise<EmployerProfileDocument> {
    const profile = await this.profileModel
      .findOneAndUpdate({ userId }, updateDto, { new: true, upsert: true })
      .populate('userId', 'username email')
      .populate('companyId')
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
