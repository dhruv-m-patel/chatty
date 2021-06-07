import { KeycloakOAuthGrant, KeycloakTokenResponse } from './keycloakTypes';
import { getKeycloakConstants } from '../constants';
import axios from 'axios';
import qs from 'querystring';

export default async function getAdminToken(): Promise<KeycloakTokenResponse> {
  const keycloak = getKeycloakConstants();
  const url = `${keycloak.URL}/realms/${keycloak.REALM}/protocol/openid-connect/token`;
  const body = {
    grant_type: 'client_credentials',
    client_id: keycloak.ADMIN_ID,
    client_secret: keycloak.ADMIN_SECRET,
  };
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  const result = await axios.post(url, qs.stringify(body), config);
  const data = (result.data as unknown) as KeycloakOAuthGrant;
  return {
    data,
    status: result.status,
  };
}
