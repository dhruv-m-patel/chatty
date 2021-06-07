import { Request, Response, NextFunction } from 'express';
import { getDecodedUserInfo } from './helpers';
import messages from './messages.i18n';
import { RequestContext } from './requestContext';

export function validateUserIsAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader: string = req.header('Authorization') || '';
  const userInfo: string = req.header('x-userinfo') || '';

  if (!authHeader) {
    res.status(401).send({ message: messages.AUTH_TOKEN_REQUIRED });
    return;
  }
  if (!userInfo) {
    res.status(401).send({ message: messages.USER_INFO_REQUIRED });
    return;
  }

  const decoded = getDecodedUserInfo(userInfo);
  if (!decoded || !decoded.preferred_username) {
    res.status(401).send({ message: messages.USER_INFO_MUST_BE_VALID });
    return;
  }
  next();
}

export function useRequestContext(
  req: Request,
  res: Response,
  next: NextFunction
) {
  RequestContext.bind(req);
  next();
}
