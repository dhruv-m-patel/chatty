import { ENDPOINTS } from '../../../src/constants';
import { ProcessEnv } from '@alcumus/express-app';
import authServiceApp from '../../../src/app';
import request from 'supertest';
import axios from 'axios';
import { StandardLoginToken } from '../../../src/types';
import { KeycloakOAuthGrant } from '../../../src/keycloak/keycloakTypes';

jest.mock('axios');

const ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1c2VySWQiOiJzb21lLXVzZXItaWQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJoZXN0aWEtdXNlci0xIn0.__2MxnL55c4XIe2JbrLsedQgrTnefdLJ56YpIxFkJzM';
const REFRESH_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM4MDIyLCJ1c2VySWQiOiJzb21lLXVzZXItaWQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJoZXN0aWEtdXNlci0xIn0.DEH_Eh041Pyyfp4tphOxYUsmlYQQRBYUX3Yh7aTDSJc';
const KEYCLOAK_TOKEN: KeycloakOAuthGrant = {
  access_token: ACCESS_TOKEN,
  refresh_token: REFRESH_TOKEN,
  refresh_expires_in: 1000,
  expires_in: 100,
  token_type: 'Bearer',
};
const EXPECTED_TOKEN: StandardLoginToken = {
  access_token: ACCESS_TOKEN,
  refresh_token: REFRESH_TOKEN,
  refresh_expires_at: 11000,
  expires_at: 10100,
  token_type: 'Bearer',
};
const KEYCLOAK_URL =
  'http://keycloak/auth/realms/test/protocol/openid-connect/token';
const KEYCLOAK_URL_QUERY = `grant_type=refresh_token&client_id=client&client_secret=sh&refresh_token=${REFRESH_TOKEN}`;

describe(`Integration Test: ${ENDPOINTS.REFRESH}`, () => {
  beforeEach(() => {
    ProcessEnv.overrideEnv({
      AUTH_SERVICE_KEYCLOAK_SERVER_URL: 'http://keycloak/auth',
      AUTH_SERVICE_KEYCLOAK_REALM: 'test',
      AUTH_SERVICE_KEYCLOAK_CLIENT_ID: 'client',
      AUTH_SERVICE_KEYCLOAK_CLIENT_SECRET: 'sh',
    });
    jest.spyOn(Date, 'now').mockImplementation(() => 10_000_000); // ms
  });

  afterEach(() => {
    jest.clearAllMocks();
    ProcessEnv.clearOverrides();
  });

  function submitRefresh(body: { refreshToken?: string }) {
    return request(authServiceApp).post(`${ENDPOINTS.REFRESH}`).send(body);
  }

  it('returns 400 if body is missing parameters', (done) => {
    submitRefresh({}).expect(400, done);
  });

  it('succeeds when Keycloak succeeds', (done) => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: KEYCLOAK_TOKEN,
      })
    );

    submitRefresh({ refreshToken: REFRESH_TOKEN })
      .expect(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          KEYCLOAK_URL,
          KEYCLOAK_URL_QUERY,
          expect.anything()
        );
      })
      .expect(200, EXPECTED_TOKEN, done);
  });

  it('fails when refresh token is expired', (done) => {
    const expiredRefreshTokenError = {
      error: 'invalid_grant',
      error_description: 'Token is not active',
    };
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockImplementationOnce(() =>
      Promise.resolve({
        status: 400,
        data: expiredRefreshTokenError,
      })
    );

    submitRefresh({ refreshToken: REFRESH_TOKEN })
      .expect(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          KEYCLOAK_URL,
          KEYCLOAK_URL_QUERY,
          expect.anything()
        );
      })
      .expect(401, expiredRefreshTokenError, done);
  });

  it('fails when non-existent realm is specified', (done) => {
    const incorrectRealm = {
      error: 'Realm does not exist',
    };
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockImplementationOnce(() =>
      Promise.resolve({
        status: 404,
        data: incorrectRealm,
      })
    );
    submitRefresh({ refreshToken: REFRESH_TOKEN })
      .expect(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          KEYCLOAK_URL,
          KEYCLOAK_URL_QUERY,
          expect.anything()
        );
      })
      .expect(500, done);
  });
});
