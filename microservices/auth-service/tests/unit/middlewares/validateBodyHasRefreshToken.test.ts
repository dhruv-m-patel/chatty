import request from 'supertest';
import express, { Request, Response } from 'express';
import validateBodyHasRefreshToken from '../../../src/middlewares/validateBodyHasRefreshToken';

const app = express();
app.use(express.json());

app.post(
  '/',
  ...validateBodyHasRefreshToken(),
  (request: Request, response: Response) => {
    response.json();
  }
);

describe('Unit Test: validateBodyHasRefreshToken', () => {
  function submitRequest(body: { refreshToken?: string }) {
    return request(app).post('/').send(body);
  }

  it('rejects request without refresh token', (done) => {
    submitRequest({}).expect(
      401,
      {
        errors: {
          refreshToken: {
            key: 'auth.token.validJwtRefreshTokenRequired',
            message: 'auth.token.validJwtRefreshTokenRequired',
          },
        },
      },
      done
    );
  });

  it('rejects request with empty refresh token', (done) => {
    submitRequest({
      refreshToken: '',
    }).expect(
      401,
      {
        errors: {
          refreshToken: {
            key: 'auth.token.validJwtRefreshTokenRequired',
            message: 'auth.token.validJwtRefreshTokenRequired',
          },
        },
      },
      done
    );
  });

  it('rejects request with refresh token that is not jwt', (done) => {
    submitRequest({
      refreshToken: 'shhhhhhh',
    }).expect(
      401,
      {
        errors: {
          refreshToken: {
            key: 'auth.token.validJwtRefreshTokenRequired',
            message: 'auth.token.validJwtRefreshTokenRequired',
          },
        },
      },
      done
    );
  });

  it('accepts valid refresh token', (done) => {
    submitRequest({
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    }).expect(200, done);
  });
});
