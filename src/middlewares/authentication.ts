import { NextFunction, Request, Response } from 'express';
import { decodeBasicAuthentication } from '../utils/authorizationUtils';
import { findApplicationByBasicAuthData } from '../services/applicationService';
import { findActiveTokenByValue } from '../repositories/accessTokenRepository';
import {
  findApplicationById,
  findApplicationByLabelAndSecret,
} from '../repositories/applicationRepository';
import { StandardError } from '../types/StandardError';
import { errorMessagesEnum } from '../utils/errorMessages';

export const authenticateThirdPartyBasicAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authorization = req.headers.authorization as string;
    if (!authorization) {
      throw new StandardError(errorMessagesEnum.UNAUTHORIZED);
    }
    const { username, secret } = decodeBasicAuthentication(authorization);
    const application = await findApplicationByLabelAndSecret({
      label: username,
      secret,
    });
    res.locals.application = application;
    next();
  } catch (e) {
    console.log('authenticateThirdPartyBasicAuth error', e);
    next(e);
  }
};

export const authenticateJwtAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization as string;
  if (!authorization) {
    throw new StandardError(errorMessagesEnum.UNAUTHORIZED);
  }
  const accessToken = await findActiveTokenByValue(authorization.split(' ')[1]);
  if (!accessToken) {
    throw new StandardError(errorMessagesEnum.UNAUTHORIZED);
  }
  const application = await findApplicationById(accessToken.applicationId);
  res.locals.accessToken = accessToken;
  res.locals.application = application;
  next();
};
