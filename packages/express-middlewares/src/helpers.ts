import { Request } from 'express';
import messages from './messages.i18n';
import { RequestContext } from './requestContext';
import * as uuid from 'uuid';

export async function getCompanyId(request: Request): Promise<string> {
  const userId = getEmployeeId(request);
  if (userId) {
    // todo in the general case this should call GET /users/api/v1/users/{id}
    return 'kAx4oWodX';
  }
  throw new Error(messages.NOT_AUTHENTICATED);
}

export function getEmployeeId(request: Request): string {
  const context = RequestContext.get(request);
  const userId = context.userId;
  if (!userId) {
    throw new Error(messages.NOT_AUTHENTICATED);
  }
  return userId;
}

export function extractEmployeeId(request: Request): string | undefined {
  const userInfo = request.header('x-userinfo');
  if (userInfo) {
    const decoded = getDecodedUserInfo(userInfo);
    if (decoded && decoded.preferred_username) {
      return decoded.preferred_username;
    }
  }
  return undefined;
}

export function extractCorrelationId(
  request: Request,
  requestId: string
): string {
  const previousCorrelationId: string | undefined = request.header(
    'x-correlationid'
  );
  if (previousCorrelationId) {
    return `${previousCorrelationId}${uuid.v4()}`;
  }
  return requestId;
}

interface DecodedUserInfo {
  // eslint-disable-next-line camelcase
  preferred_username?: string;
}

export function getDecodedUserInfo(encodedUserInfo: string): DecodedUserInfo {
  try {
    const buffer = Buffer.from(encodedUserInfo, 'base64');
    const decodedString = buffer.toString('ascii');
    return JSON.parse(decodedString);
  } catch (error) {
    return {};
  }
}
