import { IsArray, IsMongoId, IsOptional, ArrayMinSize } from 'class-validator';

export class CreateConversationDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  participantIds: string[];

  @IsOptional()
  @IsMongoId()
  jobId?: string;
}
