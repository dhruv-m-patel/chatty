import request from 'supertest';
import express, { Request, Response } from 'express';
import validateLoginRequest from '../../../src/middlewares/validateLoginRequest';

const app = express();
app.use(express.json());

app.post(
  '/',
  ...validateLoginRequest(),
  (request: Request, response: Response) => {
    response.json();
  }
);

describe('Unit Test: validateLoginRequest', () => {
  function submitLogin(body: { username?: string; password?: string }) {
    return request(app).post('/').send(body);
  }

  it('rejects request without username and password', (done) => {
    submitLogin({}).expect(
      401,
      {
        errors: {
          password: {
            key: 'auth.login.passwordDoesNotExist',
            message: 'auth.login.passwordDoesNotExist',
          },
          username: {
            key: 'auth.login.userNameDoesNotExist',
            message: 'auth.login.userNameDoesNotExist',
          },
        },
      },
      done
    );
  });

  it('rejects request with empty username and password', (done) => {
    submitLogin({
      username: '',
      password: '',
    }).expect(
      401,
      {
        errors: {
          password: {
            key: 'auth.login.passwordDoesNotExist',
            message: 'auth.login.passwordDoesNotExist',
          },
          username: {
            key: 'auth.login.userNameDoesNotExist',
            message: 'auth.login.userNameDoesNotExist',
          },
        },
      },
      done
    );
  });

  it('rejects request with username that is not an email', (done) => {
    submitLogin({ username: 'hello', password: 'world' }).expect(
      401,
      {
        errors: {
          username: {
            key: 'auth.login.userNameIsNotEmail',
            message: 'auth.login.userNameIsNotEmail',
          },
        },
      },
      done
    );
  });

  it('allows request with valid email and password', (done) => {
    submitLogin({ username: 'hello@world.com', password: 'world' }).expect(
      200,
      done
    );
  });
});
