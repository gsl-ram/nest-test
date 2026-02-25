import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
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
  @IsOptional()
  @ValidateNested()
  @Type(() => ModulePermissionsDto)
  users?: ModulePermissionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ModulePermissionsDto)
  roles?: ModulePermissionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ModulePermissionsDto)
  jobs?: ModulePermissionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ModulePermissionsDto)
  applications?: ModulePermissionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ModulePermissionsDto)
  companies?: ModulePermissionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ModulePermissionsDto)
  profiles?: ModulePermissionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ModulePermissionsDto)
  admin?: ModulePermissionsDto;
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PermissionsDto)
  permissions: PermissionsDto;
}
