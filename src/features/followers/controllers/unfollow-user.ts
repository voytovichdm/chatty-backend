import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { followerQueue } from '../../../shared/services/queues/follower.queue';
import { FollowerCache } from '../../../shared/services/redis/follower.cache';


const followerCache: FollowerCache = new FollowerCache();

export class Remove {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followeeId, followerId } = req.params;

    const removeFollowerFromCache: Promise<void> = followerCache.removeFollowerFromCache(
      `following:${req.currentUser!.userId}`,
      followeeId
    );
    const removeFolloweeFromCache: Promise<void> = followerCache.removeFollowerFromCache(`followers:${followeeId}`, followerId);

    const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followeeId}`, 'followersCount', -1);
    const followeeCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followerId}`, 'followingCount', -1);
    await Promise.all([removeFollowerFromCache, removeFolloweeFromCache, followersCount, followeeCount]);

    followerQueue.addFollowerJob('removeFollowerFromDB', {
      keyOne: `${followeeId}`,
      keyTwo: `${followerId}`
    });
    
    res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now' });
  }
}
