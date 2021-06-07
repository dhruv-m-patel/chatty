import app from '../../../src/app';
import request from 'supertest';
import { ENDPOINTS } from '../../../src/constants';
import axios from 'axios';
import { ProcessEnv } from '@alcumus/express-app';
import authServiceApp from '../../../src/app';
import {
  PLATFORM_UNAVAILABLE_ERROR,
  UNAUTHENTICATED_RESPONSE_MESSAGE,
} from '../../../src/models/loginWithAlcumusPlatform';

jest.mock('axios');

describe(`Integration: ${ENDPOINTS.AP_LOGIN}`, () => {
  beforeAll(() => {
    ProcessEnv.overrideEnv({
      ALCUMUS_PLATFORM_URL: 'http://localhost:3001/api',
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
    ProcessEnv.clearOverrides();
  });

  function submitLogin(body: { username?: string; password?: string }) {
    return request(authServiceApp).post(`${ENDPOINTS.AP_LOGIN}`).send(body);
  }

  describe('validators', () => {
    it('validates that body has username and password', (done) => {
      submitLogin({}).then((response) => {
        expect(response.status).toEqual(400);
        done();
      });
    });

    it('does not allow empty username and password', (done) => {
      submitLogin({
        username: '',
        password: '',
      }).then((response) => {
        expect(response.status).toEqual(401);
        expect(response.body).toEqual({
          errors: {
            username: {
              key: 'auth.login.userNameDoesNotExist',
              message: 'auth.login.userNameDoesNotExist',
            },
            password: {
              key: 'auth.login.passwordDoesNotExist',
              message: 'auth.login.passwordDoesNotExist',
            },
          },
        });
        done();
      });
    });

    it('validates that body has email userName', (done) => {
      submitLogin({
        username: 'not an email',
        password: 'something secret',
      }).then((response) => {
        expect(response.status).toEqual(401);
        expect(response.body).toEqual({
          errors: {
            username: {
              key: 'auth.login.userNameIsNotEmail',
              message: 'auth.login.userNameIsNotEmail',
            },
          },
        });
        done();
      });
    });
  });

  describe('passthrough', () => {
    it('returns a token with valid credentials', (done) => {
      const mockedAxios = axios as jest.Mocked<typeof axios>;

      mockedAxios.post.mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            ok: true,
            processed: [],
            notAuthorised: {},
            errors: [false],
            client: {
              events: [],
              notifications: [],
              data: {
                access_token:
                  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0NkVaOHZpZ3dGd2JVRFRDTGZvWXU1c2xFbTFOWFBZQ1YwaTdFYS1VSkpBIn0.eyJleHAiOjE2MTkwMjIyMTksImlhdCI6MTYxOTAxODYxOSwianRpIjoiYmJhYzg4MzMtZGYxMC00Y2Q2LWFhNWItNTg1MjhhMTgzNTg2IiwiaXNzIjoiaHR0cHM6Ly9hdXRobi5hbGNkZXYubmV0L2F1dGgvcmVhbG1zL3dmZGV2IiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImJlOGU3Mzc1LWQ0ZGEtNGRlMS1hMjEzLTJlMWZjZTZjNWZmZiIsInR5cCI6IkJlYXJlciIsImF6cCI6Imhlc3RpYSIsInNlc3Npb25fc3RhdGUiOiI2YzUxNDIwZC1hNmU5LTRkNjEtODY1Zi1iNTk0OTlkNzBhMjUiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiIxNjE1MGU0MS0zOGQ5LTQzYjQtYTg0MS0xMmIxNTQ5M2NmMWUifQ.E8foFwipCVOmJy0J9ekx0gpbS_LpBsS5uKVrt3NZcl2cGNBuP56LcfnBQTJIPjUL2ZmoccSLLJzNSJIQ_r6y7WCEI3E0e1VGNxUntIcZCdghGOAEiiSMYoC6P-_21YWzbZmOERdZCFuWux3cLim2yiULoNFAUTg5l20-dPuvdizX4ORf7y2awY7mOrruGJ11SCgzc-IImwE1DpPxiwLT5hCHM8-iavihh6jtw1jv8LxtCa0SEPZw0vo_xhiVa526Y8i36HLv1RdIiSfVaaBaeMBkysZxq000rQyRuBHP73ArRPKGR825oqksLmFAwqD3URYO1XhJx7_OGuTwK1GD5g',
                expires_at: 1619022219,
                refresh_token:
                  'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI5NjFlM2I2Zi1kNmFkLTQ0NTQtOGY2MC1lNjNhYTNhYjI3ZGYifQ.eyJleHAiOjE2MTkwMjU4MTksImlhdCI6MTYxOTAxODYxOSwianRpIjoiYmRjM2VmMDMtZjNiZC00Yzg3LWJmODktNDZmYzNlNWNhMjRmIiwiaXNzIjoiaHR0cHM6Ly9hdXRobi5hbGNkZXYubmV0L2F1dGgvcmVhbG1zL3dmZGV2IiwiYXVkIjoiaHR0cHM6Ly9hdXRobi5hbGNkZXYubmV0L2F1dGgvcmVhbG1zL3dmZGV2Iiwic3ViIjoiYmU4ZTczNzUtZDRkYS00ZGUxLWEyMTMtMmUxZmNlNmM1ZmZmIiwidHlwIjoiUmVmcmVzaCIsImF6cCI6Imhlc3RpYSIsInNlc3Npb25fc3RhdGUiOiI2YzUxNDIwZC1hNmU5LTRkNjEtODY1Zi1iNTk0OTlkNzBhMjUiLCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIn0.pNKaZ-gbCTzjRwiWy9OYdN6L79HX9NplQTInHHGUivg',
                refresh_expires_at: 1619025819,
                token_type: 'bearer',
                id: '16150e41-38d9-43b4-a841-12b15493cf1e',
                lastLoggedIn: 1619018619572,
                migrated: false,
                name: 'Test User',
                email: 'test.user@test.co',
              },
            },
            statusCode: 200,
            _log: [],
          },
        })
      );

      request(app)
        .post(ENDPOINTS.AP_LOGIN)
        .send({
          username: 'secretagent@email.com',
          password: 'theNameIsBond',
        })
        .then((response) => {
          expect(mockedAxios.post).toHaveBeenCalled();
          expect(response.status).toEqual(200);
          expect(response.body.client.data.access_token).toBeDefined();
          expect(response.body.client.data.refresh_token).toBeDefined();
          expect(response.body.client.data.refresh_expires_at).toBeDefined();
          expect(response.body.client.data.token_type).toBeDefined();
          expect(response.body.client.data.name).toBeDefined();
          expect(response.body.client.data.email).toBeDefined();
          done();
        });
    });

    it('returns 401 if passthrough returns 401 message with 500 status code', (done) => {
      const mockedAxios = axios as jest.Mocked<typeof axios>;
      const expectedError = `"${UNAUTHENTICATED_RESPONSE_MESSAGE}"`;

      // note: the 500 below is not a typo. This is actually how AP
      // tells people that they are not authenticated.
      mockedAxios.post.mockImplementationOnce(() =>
        Promise.resolve({
          status: 500,
          data: UNAUTHENTICATED_RESPONSE_MESSAGE,
        })
      );

      submitLogin({ username: 'iamwrong@email.com', password: 'soami' }).expect(
        401,
        expectedError,
        done
      );
    });

    it('returns 500 if pass-through returns 500 status code and message', (done) => {
      const mockedAxios = axios as jest.Mocked<typeof axios>;
      const platformError = '500:Alcumus Platform encountered a problem';

      // note: the 500 below is not a typo. This is actually how AP
      // tells people that they are not authenticated.
      mockedAxios.post.mockImplementationOnce(() =>
        Promise.resolve({
          status: 500,
          data: platformError,
        })
      );

      submitLogin({ username: 'iamwrong@email.com', password: 'soami' }).expect(
        500,
        PLATFORM_UNAVAILABLE_ERROR,
        done
      );
    });
  });
});
