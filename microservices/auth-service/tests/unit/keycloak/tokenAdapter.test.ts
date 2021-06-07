import transformToken from '../../../src/keycloak/tokenAdapter';
import fromUnixTime from 'date-fns/fromUnixTime';
import { KeycloakOAuthGrant } from '../../../src/keycloak/keycloakTypes';

const REFRESH_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikpvc2VwaCBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.P8mirVCmtb6FU0Bj9lrVFM62YUfpSWWVwC4xeaBfN3Y';
const TOKEN_TYPE = 'Bearer';

describe('Unit Test: tokenAdapter', () => {
  describe('transformToken', () => {
    it('calculates expiry and refresh expiry times', () => {
      const date = fromUnixTime(10000);
      const rawKeycloakToken: KeycloakOAuthGrant = {
        refresh_token: REFRESH_TOKEN,
        access_token: ACCESS_TOKEN,
        expires_in: 100,
        refresh_expires_in: 1000,
        token_type: TOKEN_TYPE,
      };
      const transformedToken = transformToken(rawKeycloakToken, date);
      expect(transformedToken.access_token).toEqual(ACCESS_TOKEN);
      expect(transformedToken.refresh_token).toEqual(REFRESH_TOKEN);
      expect(transformedToken.token_type).toEqual(TOKEN_TYPE);
      expect(transformedToken.expires_at).toEqual(10100);
      expect(transformedToken.refresh_expires_at).toEqual(11000);
    });
  });
});
