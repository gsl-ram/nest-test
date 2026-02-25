import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    relatedId?: string,
  ): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      userId,
      type,
      title,
      body,
      relatedId,
    });
    return notification.save();
  }

  async findByUser(
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number; skip?: number },
  ): Promise<{ notifications: NotificationDocument[]; total: number }> {
    const filter: Record<string, unknown> = { userId };
    if (options?.unreadOnly) {
      filter.read = false;
    }
    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(options?.skip ?? 0)
        .limit(options?.limit ?? 20)
        .exec(),
      this.notificationModel.countDocuments(filter).exec(),
    ]);
    return { notifications, total };
  }

  async findOne(id: string, userId: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException(`Notification with id "${id}" not found`);
    }
    if (notification.userId.toString() !== userId) {
      throw new NotFoundException(`Notification with id "${id}" not found`);
    }
    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument> {
    const notification = await this.findOne(id, userId);
    notification.read = true;
    return notification.save();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany({ userId, read: false }, { read: true })
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ userId, read: false }).exec();
  }
}
