import { Request, Response } from 'express';
import { config } from '../../../config';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { BadRequestError } from '../../../shared/globals/helpers/error-handler';
import { joiValidation } from '../../../shared/globals/decorators/joi-validation.decorators';
import { loginSchema } from '../schemes/signin';
import { IAuthDocument } from '../interfaces/auth.interface';
import { authService } from '../../../shared/globals/services/db/auth.service';
import { IUserDocument } from '../user/interfaces/user.interface';
import { userService } from '../../../shared/globals/services/db/user.service';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const userJwt: string = JWT.sign(
      {
        userId: existingUser._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };
    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: existingUser, token: userJwt });
  }
}
