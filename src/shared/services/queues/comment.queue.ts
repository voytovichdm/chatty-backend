import { commentWorker } from '../../../shared/workers/comment.worker';
import { BaseQueue } from './base.queue';
import { ICommentJob } from '../../../features/comments/interfaces/comment.interface';

class CommentQueue extends BaseQueue {
  constructor() {
    super('comments');
    this.processJob('addCommentToDB', 5, commentWorker.addCommentToDB);
  }

  public addCommentJob(name: string, data: ICommentJob): void {
    this.addJob(name, data);
  }
}

export const commentQueue: CommentQueue = new CommentQueue();
