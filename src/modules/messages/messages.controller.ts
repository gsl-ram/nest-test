import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('conversations/:conversationId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @RequirePermission('profiles', 'create')
  @Post()
  create(
    @Param('conversationId') conversationId: string,
    @Body() createDto: CreateMessageDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.messagesService.create(
      conversationId,
      userId,
      createDto.content,
    );
  }

  @RequirePermission('profiles', 'view')
  @Get()
  findAll(
    @Param('conversationId') conversationId: string,
    @CurrentUser('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messagesService.findByConversation(conversationId, userId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
    });
  }

  @RequirePermission('profiles', 'edit')
  @Patch(':id/read')
  markAsRead(
    @Param('conversationId') conversationId: string,
    @Param('id') messageId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.messagesService.markAsRead(messageId, userId);
  }
}
