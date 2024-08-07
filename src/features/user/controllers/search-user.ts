import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { Helpers } from '../../../shared/globals/helpers/helpers';
import { ISearchUser } from '../interfaces/user.interface';
import { userService } from '../../../shared/services/db/user.service';

export class Search {
  public async user(req: Request, res: Response): Promise<void> {
    const regex = new RegExp(Helpers.escapeRegex(req.params.query), 'i');
    const users: ISearchUser[] = await userService.searchUsers(regex);
    res.status(HTTP_STATUS.OK).json({ message: 'Search results', search: users });
  }
}
