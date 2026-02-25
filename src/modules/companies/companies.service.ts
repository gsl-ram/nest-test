import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async create(
    createCompanyDto: CreateCompanyDto,
    createdBy: string,
  ): Promise<CompanyDocument> {
    const company = new this.companyModel({
      ...createCompanyDto,
      createdBy,
    });
    return company.save();
  }

  async findAll(): Promise<CompanyDocument[]> {
    return this.companyModel.find().populate('createdBy', 'username email').exec();
  }

  async findOne(id: string): Promise<CompanyDocument> {
    const company = await this.companyModel
      .findById(id)
      .populate('createdBy', 'username email')
      .exec();
    if (!company) {
      throw new NotFoundException(`Company with id "${id}" not found`);
    }
    return company;
  }

  async findByCreatedBy(createdBy: string): Promise<CompanyDocument[]> {
    return this.companyModel
      .find({ createdBy })
      .populate('createdBy', 'username email')
      .exec();
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    userId: string,
  ): Promise<CompanyDocument> {
    const company = await this.companyModel.findById(id).exec();
    if (!company) {
      throw new NotFoundException(`Company with id "${id}" not found`);
    }
    if (company.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only update your own company');
    }
    const updated = await this.companyModel
      .findByIdAndUpdate(id, updateCompanyDto, { new: true })
      .populate('createdBy', 'username email')
      .exec();
    if (!updated) throw new NotFoundException(`Company with id "${id}" not found`);
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const company = await this.companyModel.findById(id).exec();
    if (!company) {
      throw new NotFoundException(`Company with id "${id}" not found`);
    }
    if (company.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own company');
    }
    await this.companyModel.findByIdAndDelete(id).exec();
  }
}
