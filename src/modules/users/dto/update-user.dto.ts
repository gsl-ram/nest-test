import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsMongoId,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;

  @IsOptional()
  @IsMongoId()
  role?: string;
}
