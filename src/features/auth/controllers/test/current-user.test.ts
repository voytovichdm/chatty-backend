import { Request, Response } from 'express';
import { authMockRequest, authMockResponse, authUserPayload } from '../../../../mocks/auth.mock';
import { UserCache } from '../../../../shared/globals/services/redis/user.cache';
import { IUserDocument } from '../../user/interfaces/user.interface';
import { CurrentUser } from '../current-user';
import { existingUser } from '../../../../mocks/user.mock';


jest.mock('../../../../shared/globals/services/queues/base.queue');
jest.mock('../../../../shared/globals/services/redis/user.cache');
jest.mock('../../../../shared/globals/services/db/user.service');

const USERNAME = 'Manny';
const PASSWORD = 'manny1';

describe('CurrentUser', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('token', () => {
    it('should set session token to null and send correct json response', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue({} as IUserDocument);

      await CurrentUser.prototype.read(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: null,
        isUser: false,
        user: null
      });
    });

    it('should set session token and send correct json response', async () => {
      const req: Request = authMockRequest({ jwt: '12djdj34' }, { username: USERNAME, password: PASSWORD }, authUserPayload) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

      await CurrentUser.prototype.read(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: req.session?.jwt,
        isUser: true,
        user: existingUser
      });
    });
  });
});