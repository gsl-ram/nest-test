import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

export class ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export class Permissions {
  users: ModulePermissions;
  roles: ModulePermissions;
}

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  name: string;

  @Prop({ type: Object, required: true })
  permissions: Permissions;

  createdAt: Date;
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
