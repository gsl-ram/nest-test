import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateEmployerProfileDto {
  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsMongoId()
  companyId?: string;

  @IsOptional()
  @IsString()
  verificationStatus?: string;
}
