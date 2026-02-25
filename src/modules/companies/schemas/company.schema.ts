import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ trim: true })
  website: string;

  @Prop({ trim: true })
  industry: string;

  @Prop({ trim: true })
  companySize: string;

  @Prop({ trim: true })
  location: string;

  @Prop({ trim: true })
  logo: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  createdBy: mongoose.Types.ObjectId;

  @Prop({ default: 'pending' })
  verificationStatus: string;

  createdAt: Date;
  updatedAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

CompanySchema.index({ createdBy: 1 });
CompanySchema.index({ name: 'text', description: 'text' });
