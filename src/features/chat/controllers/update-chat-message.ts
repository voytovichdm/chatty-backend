import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';

import { MessageCache } from '../../../shared/services/redis/message.cache';
import { markChatSchema } from '../schemes/chat';
import { joiValidation } from '../../../shared/globals/decorators/joi-validation.decorators';
import { IMessageData } from '../interfaces/chat.interface';
import { socketIOChatObject } from '../../../shared/sockets/chat';
import { chatQueue } from '../../../shared/services/queues/chat.queue';


const messageCache: MessageCache = new MessageCache();

export class Update {
  @joiValidation(markChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const { senderId, receiverId } = req.body;
    const updatedMessage: IMessageData = await messageCache.updateChatMessages(`${senderId}`, `${receiverId}`);
    socketIOChatObject.emit('message read', updatedMessage);
    socketIOChatObject.emit('chat list', updatedMessage);
    chatQueue.addChatJob('markMessagesAsReadInDB', {
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(receiverId)
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Message marked as read' });
  }
}
