import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type JobSeekerProfileDocument = HydratedDocument<JobSeekerProfile>;

class EducationItem {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
}

class ExperienceItem {
  company: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
}

@Schema({ timestamps: true })
export class JobSeekerProfile {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, unique: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  education: EducationItem[];

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [Object], default: [] })
  experience: ExperienceItem[];

  @Prop({ trim: true })
  resume: string;

  @Prop()
  expectedSalary: number;

  @Prop({ trim: true })
  preferredLocation: string;

  @Prop({ type: [String], default: [] })
  portfolioLinks: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const JobSeekerProfileSchema =
  SchemaFactory.createForClass(JobSeekerProfile);
