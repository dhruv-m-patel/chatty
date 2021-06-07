import { KeycloakOAuthGrant } from './keycloakTypes';
import { StandardLoginToken } from '../types';
import add from 'date-fns/add';
import getUnixTime from 'date-fns/getUnixTime';

export default function transformToken(
  token: KeycloakOAuthGrant,
  now: Date
): StandardLoginToken {
  const expiresAt = getUnixTime(
    add(now, {
      seconds: token.expires_in,
    })
  );
  const refreshExpiresAt = getUnixTime(
    add(now, {
      seconds: token.refresh_expires_in,
    })
  );
  return {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: expiresAt,
    refresh_expires_at: refreshExpiresAt,
    token_type: token.token_type,
  };
}
