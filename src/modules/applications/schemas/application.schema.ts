import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Job } from '../../jobs/schemas/job.schema';
import { User } from '../../users/schemas/user.schema';

export type ApplicationDocument = HydratedDocument<Application>;

export type ApplicationStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'HIRED';

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Job.name, required: true })
  jobId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  seekerId: mongoose.Types.ObjectId;

  @Prop({ trim: true })
  resumeSnapshot: string;

  @Prop({ trim: true })
  coverLetter: string;

  @Prop({ default: 'APPLIED' })
  status: ApplicationStatus;

  @Prop({ default: () => new Date() })
  appliedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

ApplicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });
ApplicationSchema.index({ seekerId: 1 });
ApplicationSchema.index({ status: 1 });
