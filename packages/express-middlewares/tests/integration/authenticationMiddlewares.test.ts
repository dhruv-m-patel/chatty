import request from 'supertest';
import express, { Application, Request, Response } from 'express';
import { validateUserIsAuthenticated } from '../../build';
import messages from '../../src/messages.i18n';

const ENCODED_USER_INFO =
  'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogIm15VXNlcklkMTIzIiB9';
const BAD_ENCODING = 'tghjkdslasedferq2134';
const GOOD_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0NkVaOHZpZ3dGd2JVRFRDTGZvWXU1c2xFbTFOWFBZQ1YwaTdFYS1VSkpBIn0.eyJleHAiOjE2MjIxNDQyMDQsImlhdCI6MTYyMjE0MDYwNCwianRpIjoiYTM4ZTgyNDgtZjk1OC00YzQ2LTgzNmQtZTUyM2Y5NTQwZGNlIiwiaXNzIjoiaHR0cHM6Ly9hdXRobi5hbGNkZXYubmV0L2F1dGgvcmVhbG1zL3dmZGV2IiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImJlOGU3Mzc1LWQ0ZGEtNGRlMS1hMjEzLTJlMWZjZTZjNWZmZiIsInR5cCI6IkJlYXJlciIsImF6cCI6Imhlc3RpYSIsInNlc3Npb25fc3RhdGUiOiIyMTZkMzc0Zi02YTU4LTRhOWQtYmQzZC1kMDdiZjM5YTc1MzEiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiIxNjE1MGU0MS0zOGQ5LTQzYjQtYTg0MS0xMmIxNTQ5M2NmMWUifQ.Pn2JzVY4wP46IMsRWsMqo6IAiPx9K2E4mVK6VYp5E1izYvXVuBHvhh5BDhjEk2pkDoXETRk_XNtJUoQPU7-53kGi_oGiRGwVOn396UrvSsfIwIS9ftyDssMfzd0BAnTk_LmFhNzgfrJxGFY0FoLTEtsLd3aI7zZKgGeerZmYVyS84u9imPGqm4kGBrpS0bApwW_ey_LTA1RWOHi7Yy201rvpGhjzdcEUAh3mtN2mCihH5GRUObfmaIuqn-5qgZxhuzmc_2PtqG4xFur1SPmaLBcNzt9m4ite0xTB7twa3SyXWhqdaZz5y1sO4f8A-Jx9KxmBz_YjvrOQ3O_D3vE4Qg';

describe('Integration tests: express-middlewares/validateUserIsAuthenticated', () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.get('/', validateUserIsAuthenticated, (req: Request, res: Response) => {
      res.json({});
    });
  });

  describe('validateUserIsAuthenticated', () => {
    it('sends back 401 if authorization token is missing', (done) => {
      request(app).get('/').expect(
        401,
        {
          message: messages.AUTH_TOKEN_REQUIRED,
        },
        done
      );
    });

    it('sends back 401 if x-userinfo header is missing', (done) => {
      request(app).get('/').auth(GOOD_TOKEN, { type: 'bearer' }).expect(
        401,
        {
          message: messages.USER_INFO_REQUIRED,
        },
        done
      );
    });

    it('characterization - sends back 401 if x-userinfo header not understood', (done) => {
      request(app)
        .get('/')
        .set('x-userinfo', BAD_ENCODING)
        .auth(GOOD_TOKEN, { type: 'bearer' })
        // note: 401 actually expected.
        .expect(500, {}, done);
    });

    it('sends back 200 if everything OK', (done) => {
      request(app)
        .get('/')
        .set('x-userinfo', ENCODED_USER_INFO)
        .auth(GOOD_TOKEN, { type: 'bearer' })
        .expect(200, {}, done);
    });
  });
});
