import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private conversationsService: ConversationsService,
  ) {}

  async create(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<MessageDocument> {
    await this.conversationsService.findOne(conversationId, senderId);
    const message = new this.messageModel({
      conversationId,
      senderId,
      content,
    });
    return message.save();
  }

  async findByConversation(
    conversationId: string,
    userId: string,
    options?: { page?: number; limit?: number },
  ): Promise<{ messages: MessageDocument[]; total: number }> {
    await this.conversationsService.findOne(conversationId, userId);
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this.messageModel
        .find({ conversationId })
        .populate('senderId', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.messageModel.countDocuments({ conversationId }).exec(),
    ]);
    return { messages: messages.reverse(), total };
  }

  async markAsRead(messageId: string, userId: string): Promise<MessageDocument> {
    const message = await this.messageModel.findById(messageId).exec();
    if (!message) {
      throw new NotFoundException(`Message with id "${messageId}" not found`);
    }
    await this.conversationsService.findOne(
      message.conversationId.toString(),
      userId,
    );
    message.read = true;
    return message.save();
  }
}
