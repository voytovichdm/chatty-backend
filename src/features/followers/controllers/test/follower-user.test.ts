import { Request, Response } from 'express';
import { Server } from 'socket.io';
import * as followerServer from '../../../../shared/sockets/follower';
import { followersMockRequest, followersMockResponse } from '../../../../mocks/followers.mock';
import { authUserPayload } from '../../../../mocks/auth.mock';
import { FollowerCache } from '../../../../shared/services/redis/follower.cache';
import { UserCache } from '../../../../shared/services/redis/user.cache';
import { existingUser } from '../../../../mocks/user.mock';
import { Add } from '../follower-user';
import { followerQueue } from '../../../../shared/services/queues/follower.queue';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/redis/follower.cache');

Object.defineProperties(followerServer, {
  socketIOFollowerObject: {
    value: new Server(),
    writable: true
  }
});

describe('Add', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('follower', () => {
    it('should call updateFollowersCountInCache', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
      const res: Response = followersMockResponse();
      jest.spyOn(FollowerCache.prototype, 'updateFollowersCountInCache');
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

      await Add.prototype.follower(req, res);
      expect(FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledTimes(2);
      expect(FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledWith('6064861bc25eaa5a5d2f9bf4', 'followersCount', 1);
      expect(FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledWith(`${existingUser._id}`, 'followingCount', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Following user now'
      });
    });

    it('should call saveFollowerToCache', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
      const res: Response = followersMockResponse();
      jest.spyOn(followerServer.socketIOFollowerObject, 'emit');
      jest.spyOn(FollowerCache.prototype, 'saveFollowerToCache');
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

      await Add.prototype.follower(req, res);
      expect(UserCache.prototype.getUserFromCache).toHaveBeenCalledTimes(2);
      expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledTimes(2);
      expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledWith(
        `following:${req.currentUser!.userId}`,
        '6064861bc25eaa5a5d2f9bf4'
      );
      expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledWith('followers:6064861bc25eaa5a5d2f9bf4', `${existingUser._id}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Following user now'
      });
    });

    it('should call followerQueue addFollowerJob', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
      const res: Response = followersMockResponse();
      const spy = jest.spyOn(followerQueue, 'addFollowerJob');
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

      await Add.prototype.follower(req, res);
      expect(followerQueue.addFollowerJob).toHaveBeenCalledWith('addFollowerToDB', {
        keyOne: `${req.currentUser?.userId}`,
        keyTwo: '6064861bc25eaa5a5d2f9bf4',
        username: req.currentUser?.username,
        followerDocumentId: spy.mock.calls[0][1].followerDocumentId
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Following user now'
      });
    });
  });
});
