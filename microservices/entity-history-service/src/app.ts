import { configureApp, handleHealthCheck } from '@alcumus/express-app';
import path from 'path';
import entityHistoryRouter from './v1/routes/entity-history';
import { ENDPOINTS } from './constants';

const apiSpec: string = path.join(__dirname, './api/api-spec.yaml');

const entityHistoryServiceApp = configureApp({
  apiOptions: {
    apiSpec,
    specType: 'openapi',
  },
  setup: (app) => {
    app.get(ENDPOINTS.HEALTH, handleHealthCheck('Entity History Service'));
    app.use(ENDPOINTS.HISTORY, entityHistoryRouter);
  },
});

export default entityHistoryServiceApp;
