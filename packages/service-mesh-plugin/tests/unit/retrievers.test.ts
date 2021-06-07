import { ProcessEnv } from '@alcumus/express-app';
import axios from 'axios';
import { retrieveCollection, ServiceMeshEndpoint } from '../../src';
import { RequestContextBinding } from '@alcumus/express-middlewares';

jest.mock('axios');

const MESH_HOST = 'http://mesh_host:3000/api';
const PATH = '/v1/stuff';
const USER_INFO = 'abc123';
const AUTH = 'authytoken';
const ENDPOINT = ServiceMeshEndpoint.USERS;
const ENTITY = {
  _id: 1234,
  value: 'have fun',
};
const EXPECTED_HEADERS = {
  Authorization: AUTH,
  'X-userinfo': USER_INFO,
  accept: 'application/json',
  Host: ENDPOINT,
};

const context: RequestContextBinding = {
  requestId: '123',
  correlationId: '123.512',
  userId: 'user123',
  authorizationToken: AUTH,
  encodedUserinfo: USER_INFO,
};

describe('Unit tests: @alcumus/service-mesh-plugin retrievers', () => {
  let mockedAxios: jest.Mocked<typeof axios>;

  beforeEach(() => {
    ProcessEnv.overrideEnv({
      SERVICE_MESH_HOST: MESH_HOST,
    });
    mockedAxios = axios as jest.Mocked<typeof axios>;
  });

  afterEach(() => {
    jest.clearAllMocks();
    ProcessEnv.clearOverrides();
  });

  describe('retrieveCollection', () => {
    it('returns single entity', async () => {
      mockedAxios.get.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: {
            documents: [ENTITY],
          },
        })
      );
      const results = await retrieveCollection<object>({
        endpoint: ENDPOINT,
        routePath: PATH,
        context,
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${MESH_HOST}${PATH}`,
        expect.objectContaining({
          validateStatus: null,
          headers: EXPECTED_HEADERS,
        })
      );
      expect(results).toEqual({
        status: 200,
        data: [ENTITY],
      });
    });
  });
});
