import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
  ) {}

  async create(
    participantIds: string[],
    jobId?: string,
  ): Promise<ConversationDocument> {
    const ids = participantIds.map((id) => id as any);
    const existing = await this.conversationModel
      .findOne({
        participants: { $all: ids },
        $expr: { $eq: [{ $size: '$participants' }, ids.length] },
      })
      .exec();
    if (existing) return existing;
    const conversation = new this.conversationModel({
      participants: participantIds,
      jobId,
    });
    return conversation.save();
  }

  async findOne(id: string, userId: string): Promise<ConversationDocument> {
    const conversation = await this.conversationModel
      .findById(id)
      .populate('participants', 'username email')
      .populate('jobId')
      .exec();
    if (!conversation) {
      throw new NotFoundException(`Conversation with id "${id}" not found`);
    }
    const isParticipant = conversation.participants.some(
      (p: any) => p._id.toString() === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }
    return conversation;
  }

  async findByUser(userId: string): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find({ participants: userId })
      .populate('participants', 'username email')
      .populate('jobId')
      .sort({ updatedAt: -1 })
      .exec();
  }
}
