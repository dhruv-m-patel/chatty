export interface KeycloakOAuthGrant {
  // eslint-disable-next-line camelcase
  access_token: string;
  // eslint-disable-next-line camelcase
  refresh_token: string;
  // eslint-disable-next-line camelcase
  token_type: string;
  // eslint-disable-next-line camelcase
  expires_in: number;
  // eslint-disable-next-line camelcase
  refresh_expires_in: number;
}

export interface KeycloakTokenResponse {
  data: KeycloakOAuthGrant;
  status: number;
}
