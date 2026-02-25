import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @RequirePermission('profiles', 'create')
  @Post()
  create(
    @Body() createDto: CreateConversationDto,
    @CurrentUser('userId') userId: string,
  ) {
    const participantIds = [...new Set([...createDto.participantIds, userId])];
    if (participantIds.length < 2) {
      throw new ForbiddenException('Conversation must have at least 2 participants');
    }
    return this.conversationsService.create(participantIds, createDto.jobId);
  }

  @RequirePermission('profiles', 'view')
  @Get()
  findMyConversations(@CurrentUser('userId') userId: string) {
    return this.conversationsService.findByUser(userId);
  }

  @RequirePermission('profiles', 'view')
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.conversationsService.findOne(id, userId);
  }
}
