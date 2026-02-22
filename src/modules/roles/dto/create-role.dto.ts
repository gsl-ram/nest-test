import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ModulePermissionsDto {
  @IsBoolean()
  view: boolean;

  @IsBoolean()
  create: boolean;

  @IsBoolean()
  edit: boolean;

  @IsBoolean()
  delete: boolean;
}

export class PermissionsDto {
  @ValidateNested()
  @Type(() => ModulePermissionsDto)
  users: ModulePermissionsDto;

  @ValidateNested()
  @Type(() => ModulePermissionsDto)
  roles: ModulePermissionsDto;
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested()
  @Type(() => PermissionsDto)
  permissions: PermissionsDto;
}
