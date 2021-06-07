import path from 'path';
import { configureApp } from '@alcumus/express-app';
import healthRouter from './healthRoute';
import proxyRouter from './proxyRoute';
import { useRequestContext } from '@alcumus/express-middlewares';

const apiSpec: string = path.join(__dirname, './api-spec.yaml');

const ENDPOINTS = {
  HEALTH: '/api/v1/health',
  PROXY: '/api/v1/users',
};

const proxyServiceApp = configureApp({
  apiOptions: {
    apiSpec,
    specType: 'openapi',
  },
  setup: (app) => {
    app.use(useRequestContext);
    app.use(ENDPOINTS.HEALTH, healthRouter);
    app.use(ENDPOINTS.PROXY, proxyRouter);
  },
});

export default proxyServiceApp;
