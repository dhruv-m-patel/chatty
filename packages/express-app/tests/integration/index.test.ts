import express, { Response, Request } from 'express';
import request from 'supertest';
import path from 'path';
import { check } from 'express-validator';
import * as uuid from 'uuid';
import getValidationResultHandler from '../../src/validationHandler';
import { configureApp, handleHealthCheck } from '../../src';

const TEST_ROUTE = '/test';

const INVALID_REQUEST_BODY = {
  myVal: 123,
};
const VALID_REQUEST_BODY = {
  myVal: 'my string',
};

const INVALID_RESPONSE_BODY = {
  myResult: 123,
};

describe('Integrate tests: handleHealthCheck', () => {
  const SERVICE_NAME = 'serviceUnderTest';
  const app = configureApp({ setup: () => {} });

  beforeAll(() => {
    app.get('/health', handleHealthCheck(SERVICE_NAME));
  });

  it('should return health check metadata', (done) => {
    request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          pid: expect.any(Number),
          timestamp: expect.any(String),
          status: 'OK',
          serviceName: SERVICE_NAME,
          uptime: expect.any(Number),
        });
        done();
      });
  });
});

describe('Integration tests: finalErrorHandler', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(global.console, 'error').mockImplementation();
  });

  afterEach(() => {
    errorSpy.mockClear();
  });

  it('should not need to handle startup errors since they prevent server start', () => {
    const message = 'Setup Crashed';
    expect(() => {
      configureApp({
        setup: () => {
          throw new Error(message);
        },
      });
    }).toThrowError(message);
  });

  it('should handle uncaught errors in an express route', (done) => {
    const message = 'Route crashed';
    const app = configureApp({
      setup: (app) => {
        const router = express.Router();
        router.get('/', () => {
          throw new Error(message);
        });
        app.use(TEST_ROUTE, router);
      },
    });
    request(app)
      .get(TEST_ROUTE)
      .expect(() => {
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining(message),
          expect.stringContaining(message)
        );
      })
      .expect(500, { message }, done);
  });

  it('should handle error response in an express route', (done) => {
    const message = 'Route returns error message';
    const app = configureApp({
      setup: (app) => {
        const router = express.Router();
        router.get('/', (request: Request, response: Response) => {
          response.status(500).json({ message });
        });
        app.use(TEST_ROUTE, router);
      },
    });
    request(app)
      .get(TEST_ROUTE)
      .expect(() => {
        expect(errorSpy).not.toHaveBeenCalled();
      })
      .expect(500, { message }, done);
  });
});

describe('Integration tests: Service Contract Validations with OpenAPI', () => {
  let errorSpy: jest.SpyInstance;
  const validOpenApiSpec = path.join(
    __dirname,
    '../fixtures/validOpenApiSpec.test.yaml'
  );
  const invalidOpenApiSpec = path.join(
    __dirname,
    '../fixtures/invalidOpenApiSpec.test.yaml'
  );

  function configureTestAppWithInvalidOpenApiResponse(
    apiSpec: string,
    validateResponse: boolean
  ) {
    const router = express.Router();
    router.post('/', (request: Request, response: Response) => {
      response.json(INVALID_RESPONSE_BODY);
    });
    return configureApp({
      apiOptions: {
        apiSpec: apiSpec,
        specType: 'openapi',
        validateResponse: validateResponse,
      },
      setup: (app) => {
        app.use(TEST_ROUTE, router);
      },
    });
  }

  beforeEach(() => {
    errorSpy = jest.spyOn(global.console, 'error').mockImplementation();
  });

  afterEach(() => {
    errorSpy.mockClear();
  });

  it('should handle server startup errors when api spec is not valid', (done) => {
    const app = configureTestAppWithInvalidOpenApiResponse(
      invalidOpenApiSpec,
      false
    );
    request(app)
      .post('/test')
      .send(VALID_REQUEST_BODY)
      .expect(() => {
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Token "components" does not exist.'),
          expect.stringContaining(
            'MissingPointerError: Token "components" does not exist.'
          )
        );
      })
      .expect(500, { message: 'Token "components" does not exist.' }, done);
  });

  it('should validate request sending back a 400 response for bad requests', (done) => {
    const app = configureTestAppWithInvalidOpenApiResponse(
      validOpenApiSpec,
      true
    );
    request(app)
      .post('/test')
      .send(INVALID_REQUEST_BODY)
      .expect(() => {
        expect(errorSpy).not.toHaveBeenCalled();
      })
      .expect(
        400,
        {
          message: 'request.body.myVal should be string',
        },
        done
      );
  });

  it('should not validate response if not enabled', (done) => {
    const app = configureTestAppWithInvalidOpenApiResponse(
      validOpenApiSpec,
      false
    );
    request(app)
      .post('/test')
      .send(VALID_REQUEST_BODY)
      .expect(() => {
        expect(errorSpy).not.toHaveBeenCalled();
      })
      .expect(200, done);
  });

  it('should send back a 400 response with bad response when response validation is enabled', (done) => {
    const app = configureTestAppWithInvalidOpenApiResponse(
      validOpenApiSpec,
      true
    );
    request(app)
      .post('/test')
      .send(VALID_REQUEST_BODY)
      .expect(() => {
        expect(errorSpy).not.toHaveBeenCalled();
      })
      .expect(
        500,
        {
          message: '.response.myResult should be string',
        },
        done
      );
  });
});

describe('Integration tests: Service Contract Validations with Swagger', () => {
  let errorSpy: jest.SpyInstance;
  const validSwaggerSpec = path.join(
    __dirname,
    '../fixtures/validSwaggerSpec.test.yaml'
  );
  const invalidSwaggerSpec = path.join(
    __dirname,
    '../fixtures/invalidSwaggerSpec.test.yaml'
  );

  function configureTestAppWithInvalidSwaggerResponse(
    apiSpec: string,
    validateResponse: boolean
  ) {
    const router = express.Router();
    router.post('/', (request: Request, response: Response) => {
      response.json(INVALID_RESPONSE_BODY);
    });
    return configureApp({
      apiOptions: {
        apiSpec: apiSpec,
        specType: 'swagger',
        validateResponse: validateResponse,
      },
      setup: (app) => {
        app.use(TEST_ROUTE, router);
      },
    });
  }

  beforeEach(() => {
    errorSpy = jest.spyOn(global.console, 'error').mockImplementation();
  });

  afterEach(() => {
    errorSpy.mockClear();
  });

  it('should handle server startup errors when api spec is not valid', (done) => {
    const app = configureTestAppWithInvalidSwaggerResponse(
      invalidSwaggerSpec,
      false
    );
    request(app)
      .post('/test')
      .send(VALID_REQUEST_BODY)
      .expect(() => {
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            "can't resolve reference #/definitions/TestRequest from id #"
          ),
          undefined
        );
      })
      .expect(
        500,
        {
          message:
            "can't resolve reference #/definitions/TestRequest from id #",
        },
        done
      );
  });

  it('should validate request sending back a 400 response for bad requests', (done) => {
    const app = configureTestAppWithInvalidSwaggerResponse(
      validSwaggerSpec,
      true
    );
    request(app)
      .post('/test')
      .send(INVALID_REQUEST_BODY)
      .expect(() => {
        expect(errorSpy).not.toHaveBeenCalled();
      })
      .expect(
        400,
        {
          message: 'Request schema validation failed for POST/test',
        },
        done
      );
  });

  it('should not validate response if not enabled', (done) => {
    const app = configureTestAppWithInvalidSwaggerResponse(
      validSwaggerSpec,
      false
    );
    request(app)
      .post('/test')
      .send(VALID_REQUEST_BODY)
      .expect(() => {
        expect(errorSpy).not.toHaveBeenCalled();
      })
      .expect(200, done);
  });

  it('should send back a 400 response with bad response when response validation is enabled', (done) => {
    const app = configureTestAppWithInvalidSwaggerResponse(
      validSwaggerSpec,
      true
    );
    request(app)
      .post('/test')
      .send(VALID_REQUEST_BODY)
      .expect(() => {
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            'Response schema validation failed for POST/test'
          ),
          undefined
        );
      })
      .expect(
        500,
        {
          message: 'Response schema validation failed for POST/test',
        },
        done
      );
  });
});

describe('Integration tests: validationHandler', () => {
  let route: string;
  const subject = getValidationResultHandler();
  const ERROR_KEY = 'errorKey.something.is.wrong';

  const app = configureApp({ setup: () => {} });

  beforeEach(() => {
    route = '/test/' + Math.random().toString(36).substring(7);
    app.post(
      route,
      [check('email', ERROR_KEY).exists(), subject],
      (request: Request, response: Response) => {
        response.json();
      }
    );
  });

  it('should pass a valid request as is', (done) => {
    request(app)
      .post(route)
      .send({
        email: 'something@email.com',
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        done();
      });
  });

  it('should return validation errors with a 400 status for bad request', (done) => {
    request(app)
      .post(route)
      .send({})
      .then((response) => {
        expect(response.status).toEqual(400);
        expect(response.body).toEqual({
          errors: {
            email: {
              key: ERROR_KEY,
              message: ERROR_KEY,
            },
          },
        });
        done();
      });
  });
});

describe('Integrate tests: Request Tracing', () => {
  it('should inject a valid uuid v4 guid as a request identifier', (done) => {
    const app = configureApp({
      setup: (testApp: express.Application) => {
        testApp.get('/health', (req: Request, res: Response) => {
          res.json({
            message: {
              // @ts-ignore
              requestId: req.id, // Pass back request id referring to request for verification
            },
          });
        });
      },
    });

    request(app)
      .get('/health')
      .send()
      .then((response) => {
        expect(uuid.validate(response.body.message.requestId)).toBeTruthy();
        expect(uuid.version(response.body.message.requestId)).toEqual(4);
        expect(response.status).toEqual(200);
        done();
      });
  });
});
