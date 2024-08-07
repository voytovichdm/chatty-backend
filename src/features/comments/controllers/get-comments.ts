import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';

import { CommentCache } from '../../../shared/services/redis/comment.cache';
import { ICommentDocument, ICommentNameList } from '../interfaces/comment.interface';
import { commentService } from '../../../shared/services/db/comment.service';

const commentCache: CommentCache = new CommentCache();

export class Get {
  public async comments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    
    const cachedComments: ICommentDocument[] = await commentCache.getCommentsFromCache(postId);
    const comments: ICommentDocument[] = cachedComments.length
      ? cachedComments
      : await commentService.getPostComments({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post comments', comments });
  }

  public async commentsNamesFromCache(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;

    const cachedCommentsNames: ICommentNameList[] = await commentCache.getCommentsNamesFromCache(postId);
    const commentsNames: ICommentNameList[] = cachedCommentsNames.length
      ? cachedCommentsNames
      : await commentService.getPostCommentNames({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post comments names', comments: commentsNames.length ? commentsNames[0] : [] });
  }

  public async singleComment(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;
    const cachedComments: ICommentDocument[] = await commentCache.getSingleCommentFromCache(postId, commentId);
    const comments: ICommentDocument[] = cachedComments.length
      ? cachedComments
      : await commentService.getPostComments({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Single comment', comments: comments.length ? comments[0] : [] });
  }
}
