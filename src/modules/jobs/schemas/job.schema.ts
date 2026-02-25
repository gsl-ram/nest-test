import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Company } from '../../companies/schemas/company.schema';
import { User } from '../../users/schemas/user.schema';

export type JobDocument = HydratedDocument<Job>;

export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'REMOTE' | 'HYBRID';

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  requiredSkills: string[];

  @Prop()
  salaryMin: number;

  @Prop()
  salaryMax: number;

  @Prop({ default: 'FULL_TIME' })
  employmentType: EmploymentType;

  @Prop({ trim: true })
  location: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Company.name, required: true })
  companyId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  createdBy: mongoose.Types.ObjectId;

  @Prop({ default: 'OPEN' })
  status: JobStatus;

  @Prop({ default: 'APPROVED' })
  moderationStatus: string;

  @Prop()
  expiryDate: Date;

  @Prop()
  experienceLevel: string;

  createdAt: Date;
  updatedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.index({ companyId: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ expiryDate: 1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ title: 'text', description: 'text' });
JobSchema.index({ requiredSkills: 1 });
JobSchema.index({ location: 1 });
JobSchema.index({ employmentType: 1 });
