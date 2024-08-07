import { Request, Response } from 'express';
import { Server } from 'socket.io';
import * as userServer from '../../../../shared/sockets/user';
import { authMockRequest, authMockResponse, authUserPayload } from '../../../../mocks/auth.mock';
import { UserCache } from '../../../../shared/services/redis/user.cache';
import { Edit } from '../update-basic-info';
import { userQueue } from '../../../../shared/services/queues/user.queue';


jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@socket/user');
jest.mock('@service/redis/user.cache');

Object.defineProperties(userServer, {
  socketIOUserObject: {
    value: new Server(),
    writable: true
  }
});

describe('EditBasicInfo', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('info', () => {
    it('should call updateSingleUserItemInCache', async () => {
      const basicInfo = {
        quote: 'This is cool',
        work: 'KickChat Inc.',
        school: 'Taltech',
        location: 'Tallinn'
      };
      const req: Request = authMockRequest({}, basicInfo, authUserPayload, {}) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'updateSingleUserItemInCache');

      await Edit.prototype.info(req, res);
      for (const [key, value] of Object.entries(req.body)) {
        expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, key, `${value}`);
      }
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Updated successfully'
      });
    });

    it('should call updateBasicInfoInDB', async () => {
      const basicInfo = {
        quote: 'This is cool',
        work: 'KickChat Inc.',
        school: 'Taltech',
        location: 'Tallinn'
      };
      const req: Request = authMockRequest({}, basicInfo, authUserPayload, {}) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(userQueue, 'addUserJob');

      await Edit.prototype.info(req, res);
      expect(userQueue.addUserJob).toHaveBeenCalledWith('updateBasicInfoInDB', {
        key: `${req.currentUser?.userId}`,
        value: req.body
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Updated successfully'
      });
    });
  });

  describe('social', () => {
    it('should call updateSingleUserItemInCache', async () => {
      const socialInfo = {
        facebook: 'https://facebook.com/tester',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        twitter: 'https://twitter.com'
      };
      const req: Request = authMockRequest({}, socialInfo, authUserPayload, {}) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'updateSingleUserItemInCache');

      await Edit.prototype.social(req, res);
      expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'social', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Updated successfully'
      });
    });

    it('should call updateSocialLinksInDB', async () => {
      const socialInfo = {
        facebook: 'https://facebook.com/tester',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        twitter: 'https://twitter.com'
      };
      const req: Request = authMockRequest({}, socialInfo, authUserPayload, {}) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(userQueue, 'addUserJob');

      await Edit.prototype.social(req, res);
      expect(userQueue.addUserJob).toHaveBeenCalledWith('updateSocialLinksInDB', {
        key: `${req.currentUser?.userId}`,
        value: req.body
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Updated successfully'
      });
    });
  });
});
