import axios from 'axios';
import { loginWithAlcumusPlatform } from '../../../src/models/loginWithAlcumusPlatform';
import { ProcessEnv } from '@alcumus/express-app';

jest.mock('axios');

describe('Unit tests: /models/auth', () => {
  beforeEach(() => {
    ProcessEnv.overrideEnv({
      ALCUMUS_PLATFORM_URL: 'http://localhost:3001/api',
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('loginWithAlcumusPlatform should post request to alcumus-platform', async (done) => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: {},
      })
    );
    const result = await loginWithAlcumusPlatform('secret@email.co', 'pass');
    expect(mockedAxios.post).toHaveBeenCalled();
    expect(result.status).toEqual(200);
    done();
  });
});
