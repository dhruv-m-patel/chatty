import { KeycloakOAuthGrant, KeycloakTokenResponse } from './keycloakTypes';
import { getKeycloakConstants } from '../constants';
import axios from 'axios';
import qs from 'querystring';

export default async function getRefreshedToken(
  refreshToken: string
): Promise<KeycloakTokenResponse> {
  const keycloak = getKeycloakConstants();
  const url = `${keycloak.URL}/realms/${keycloak.REALM}/protocol/openid-connect/token`;
  const body = {
    grant_type: 'refresh_token',
    client_id: keycloak.CLIENT_ID,
    client_secret: keycloak.CLIENT_SECRET,
    refresh_token: refreshToken,
  };
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    validateStatus: null,
  };
  const result = await axios.post(url, qs.stringify(body), config);
  const data = (result.data as unknown) as KeycloakOAuthGrant;
  return {
    data,
    status: result.status,
  };
}
