import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { CommentCache } from '../../../shared/services/redis/comment.cache';
import { joiValidation } from '../../../shared/globals/decorators/joi-validation.decorators';
import { addCommentSchema } from '../schemes/comment';
import { ICommentDocument, ICommentJob } from '../interfaces/comment.interface';
import { commentQueue } from '../../../shared/services/queues/comment.queue';

const commentCache: CommentCache = new CommentCache();

export class Add {
  @joiValidation(addCommentSchema)
  public async comment(req: Request, res: Response): Promise<void> {
    const { userTo, postId, profilePicture, comment } = req.body;

    const commentObjectId: ObjectId = new ObjectId();
    const commentData: ICommentDocument = {
      _id: commentObjectId,
      postId,
      username: `${req.currentUser?.username}`,
      avatarColor: `${req.currentUser?.avatarColor}`,
      profilePicture,
      comment,
      createdAt: new Date()
    } as ICommentDocument;
    await commentCache.savePostCommentToCache(postId, JSON.stringify(commentData));

    const databaseCommentData: ICommentJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      comment: commentData
    };
    commentQueue.addCommentJob('addCommentToDB', databaseCommentData);
    
    res.status(HTTP_STATUS.OK).json({ message: 'Comment created successfully' });
  }
}
