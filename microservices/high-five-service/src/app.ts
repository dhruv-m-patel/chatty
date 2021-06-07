import { configureApp, handleHealthCheck } from '@alcumus/express-app';
import path from 'path';
import {
  useRequestContext,
  validateUserIsAuthenticated,
} from '@alcumus/express-middlewares';
import highFiveRouter from './v1/routes/highFive';
import highFiveTypeRouter from './v1/routes/highFiveType';
import reactionsRouter from './v1/routes/reactions';
import notesRouter from './v1/routes/notes';
import { ENDPOINTS } from './constants';

const apiSpec: string = path.join(__dirname, './api/api-spec.yaml');

const highFiveServiceApp = configureApp({
  apiOptions: {
    apiSpec,
    specType: 'openapi',
  },
  setup: (app) => {
    app.use(useRequestContext);
    app.get(ENDPOINTS.HEALTH, handleHealthCheck('High Five Service'));
    app.use(
      ENDPOINTS.HIGH_FIVE,
      validateUserIsAuthenticated,
      highFiveRouter,
      notesRouter,
      reactionsRouter
    );
    app.use(
      ENDPOINTS.HIGH_FIVE_TYPES,
      validateUserIsAuthenticated,
      highFiveTypeRouter
    );
  },
});

export default highFiveServiceApp;
