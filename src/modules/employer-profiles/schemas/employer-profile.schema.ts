import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Company } from '../../companies/schemas/company.schema';

export type EmployerProfileDocument = HydratedDocument<EmployerProfile>;

@Schema({ timestamps: true })
export class EmployerProfile {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, unique: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ trim: true })
  designation: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Company.name })
  companyId: mongoose.Types.ObjectId;

  @Prop({ default: 'pending' })
  verificationStatus: string;

  createdAt: Date;
  updatedAt: Date;
}

export const EmployerProfileSchema =
  SchemaFactory.createForClass(EmployerProfile);

EmployerProfileSchema.index({ companyId: 1 });
