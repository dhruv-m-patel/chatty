import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import SwaggerExpressValidator from 'swagger-express-validator';
import * as ExpressOpenApiValidator from 'express-openapi-validator';
import fs from 'fs';
import jsyaml from 'js-yaml';
import yamljs from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import SwaggerUiDist from 'swagger-ui-dist';
import process from 'process';
import * as uuid from 'uuid';

process.on('exit', (code) => {
  console.log(`Process ${process.pid} is exiting with exit code ${code}`);
});

interface ResponseError extends Error {
  // OpenAPI validations specify this; other errors do not.
  status?: number;
}

function finalErrorHandler(
  err: ResponseError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err) {
    if (!err.status) {
      // non-OpenAPI validation issue.
      console.error(err.message, err.stack);
    }
    res.status(err.status || 500).json({
      message: err.message,
    });
  } else {
    next();
  }
}

export interface AppOptions {
  apiOptions?: {
    apiSpec: string;
    specType: 'swagger' | 'openapi';
    validateResponse?: boolean;
  };
  setup: (app: express.Application) => void;
}

export default function configureApp(options: AppOptions): express.Application {
  const app: express.Application = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(logger('common'));
  app.use(compression());
  app.use(cookieParser());
  if (options?.apiOptions) {
    const { apiSpec, specType, validateResponse = false } = options.apiOptions;

    app.use(express.static(SwaggerUiDist.getAbsoluteFSPath()));

    // NOTES:
    // Parsing swagger spec with a loader once and reusing it for middlewares dont work correctly
    // So, if you parse apiSpec with yamljs first and then use it to setup swagger docs and then with swagger-express-validator
    // the swagger docs would work but request response validations will stop working
    // the only solution that seems to work is using two different loaders for each
    app.use(
      '/docs',
      swaggerUi.serve,
      // Parse swaggerdoc using yamljs as recommended here:
      // https://github.com/scottie1984/swagger-ui-express#load-swagger-from-yaml-file
      swaggerUi.setup(yamljs.load(apiSpec))
    );

    if (specType === 'swagger') {
      app.use(
        SwaggerExpressValidator({
          // need to reload swagger spec with a different loader otherwise swagger-ui does not work
          schema: jsyaml.load(fs.readFileSync(apiSpec, 'utf8')) as string,
          validateRequest: true,
          validateResponse: validateResponse,
          allowNullable: true,
        })
      );
    } else {
      app.use(
        ExpressOpenApiValidator.middleware({
          // need to reload swagger spec with a different loader otherwise swagger-ui does not work
          apiSpec: jsyaml.load(fs.readFileSync(apiSpec, 'utf8')) as string,
          validateRequests: true,
          validateResponses: validateResponse,
        })
      );
    }
  }

  // Add distributed tracing by injecting globally unique identifier to each request
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.id = uuid.v4();
    next();
  });

  options.setup(app);

  app.use(finalErrorHandler);

  return app;
}
