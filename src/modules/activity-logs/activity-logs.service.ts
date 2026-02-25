import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ActivityLog,
  ActivityLogDocument,
} from './schemas/activity-log.schema';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectModel(ActivityLog.name)
    private activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async log(
    userId: string,
    action: string,
    resource: string,
    metadata?: Record<string, unknown>,
  ): Promise<ActivityLogDocument> {
    const log = new this.activityLogModel({
      userId,
      action,
      resource,
      metadata: metadata || {},
    });
    return log.save();
  }

  async findByUser(
    userId: string,
    options?: { limit?: number; skip?: number },
  ): Promise<{ logs: ActivityLogDocument[]; total: number }> {
    const limit = options?.limit ?? 50;
    const skip = options?.skip ?? 0;
    const [logs, total] = await Promise.all([
      this.activityLogModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.activityLogModel.countDocuments({ userId }).exec(),
    ]);
    return { logs, total };
  }
}
