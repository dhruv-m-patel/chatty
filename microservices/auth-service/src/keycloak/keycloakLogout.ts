import { getKeycloakConstants } from '../constants';
import axios from 'axios';
import { ProcessEnv } from '@alcumus/express-app';
import qs from 'querystring';

export interface LogoutResult {
  data: object;
  status: number;
  redirect: string;
}

export default async function logout(
  refreshToken: string
): Promise<LogoutResult> {
  const keycloak = getKeycloakConstants();
  const redirectUri = ProcessEnv.getValue('AUTH_SERVICE_LOGOUT_REDIRECT_URL');
  const redirectQueryString = ProcessEnv.isEnabled(
    'AUTH_SERVICE_LOGOUT_REDIRECT_URL'
  )
    ? `?redirect_uri=${redirectUri}`
    : '';
  const url = `${keycloak.URL}/realms/${keycloak.REALM}/protocol/openid-connect/logout${redirectQueryString}`;
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    validateStatus: null,
  };
  const body = {
    client_id: keycloak.CLIENT_ID,
    client_secret: keycloak.CLIENT_SECRET,
    refresh_token: refreshToken,
  };
  const result = await axios.post(url, qs.stringify(body), config);
  return {
    data: result.data,
    status: result.status,
    redirect: result.headers?.Location,
  };
}
