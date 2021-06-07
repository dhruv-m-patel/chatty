import { configureApp, handleHealthCheck } from '@alcumus/express-app';
import path from 'path';
import { ENDPOINTS } from './constants';

const apiSpec: string = path.join(__dirname, './api/api-spec.yaml');

const entityHistoryServiceApp = configureApp({
  apiOptions: {
    apiSpec,
    specType: 'openapi',
  },
  setup: (app) => {
    app.get(ENDPOINTS.HEALTH, handleHealthCheck('Safety Intelligence Service'));
  },
});

export default entityHistoryServiceApp;
