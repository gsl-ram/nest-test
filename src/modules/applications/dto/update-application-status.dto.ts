import { IsEnum } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsEnum(['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED'])
  status: string;
}
