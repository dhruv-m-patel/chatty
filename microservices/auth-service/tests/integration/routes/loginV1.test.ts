import { ENDPOINTS } from '../../../src/constants';
import { ProcessEnv } from '@alcumus/express-app';
import authServiceApp from '../../../src/app';
import request from 'supertest';
import axios from 'axios';
import { StandardLoginToken } from '../../../src/types';
import {
  UNAUTHENTICATED_RESPONSE_MESSAGE,
  PLATFORM_UNAVAILABLE_ERROR,
} from '../../../src/models/loginWithAlcumusPlatform';

jest.mock('axios');

const ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1c2VySWQiOiJzb21lLXVzZXItaWQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJoZXN0aWEtdXNlci0xIn0.__2MxnL55c4XIe2JbrLsedQgrTnefdLJ56YpIxFkJzM';
const REFRESH_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM4MDIyLCJ1c2VySWQiOiJzb21lLXVzZXItaWQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJoZXN0aWEtdXNlci0xIn0.DEH_Eh041Pyyfp4tphOxYUsmlYQQRBYUX3Yh7aTDSJc';
const ALCUMUS_PLATFORM_TOKEN: StandardLoginToken = {
  access_token: ACCESS_TOKEN,
  refresh_token: REFRESH_TOKEN,
  refresh_expires_at: 1516238022 + 1000,
  expires_at: 1516239022 + 100,
  token_type: 'Bearer',
};

describe('Integration Test: loginV1', () => {
  beforeEach(() => {
    ProcessEnv.overrideEnv({
      ALCUMUS_PLATFORM_URL: 'http://localhost:3001/api',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    ProcessEnv.clearOverrides();
  });

  describe(`loginRouter POST /${ENDPOINTS.LOGIN}`, () => {
    function submitLogin(body: { username?: string; password?: string }) {
      return request(authServiceApp).post(`${ENDPOINTS.LOGIN}`).send(body);
    }

    it('succeeds if passthrough succeeds', (done) => {
      const mockedAxios = axios as jest.Mocked<typeof axios>;
      mockedAxios.post.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: {
            client: {
              data: ALCUMUS_PLATFORM_TOKEN,
            },
          },
        })
      );

      submitLogin({ username: 'test@email.com', password: 'password' }).expect(
        200,
        ALCUMUS_PLATFORM_TOKEN,
        done
      );
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

    it('returns 500 if passthrough returns 500 status code and message', (done) => {
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

    it('returns 400 if body is missing parameters', (done) => {
      submitLogin({}).expect(400, done);
    });
  });
});
