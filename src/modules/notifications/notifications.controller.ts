import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @RequirePermission('profiles', 'view')
  @Get()
  findAll(
    @CurrentUser('userId') userId: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const unread = unreadOnly === 'true';
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? Math.min(parseInt(limit, 10), 50) : 20;
    const skip = (pageNum - 1) * limitNum;
    return this.notificationsService.findByUser(userId, {
      unreadOnly: unread,
      skip,
      limit: limitNum,
    });
  }

  @RequirePermission('profiles', 'view')
  @Get('count/unread')
  getUnreadCount(@CurrentUser('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId).then((count) => ({
      count,
    }));
  }

  @RequirePermission('profiles', 'view')
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.notificationsService.findOne(id, userId);
  }

  @RequirePermission('profiles', 'edit')
  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @RequirePermission('profiles', 'edit')
  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  markAllAsRead(@CurrentUser('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
