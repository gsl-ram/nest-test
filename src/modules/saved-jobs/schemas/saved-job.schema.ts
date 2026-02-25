import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Job } from '../../jobs/schemas/job.schema';

export type SavedJobDocument = HydratedDocument<SavedJob>;

@Schema({ timestamps: true })
export class SavedJob {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Job.name, required: true })
  jobId: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const SavedJobSchema = SchemaFactory.createForClass(SavedJob);

SavedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });
SavedJobSchema.index({ userId: 1 });
