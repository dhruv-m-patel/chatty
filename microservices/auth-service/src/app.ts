import path from 'path';
import { configureApp } from '@alcumus/express-app';
import { ENDPOINTS } from './constants';
import healthRouter from './routes/health';
import alcumusPlatformLoginRouter from './routes/platformLoginV1';
import loginRouter from './routes/loginV1';
import refreshTokenRouter from './routes/refreshTokenV1';
import logoutRouterV1 from './routes/logoutV1';

const apiSpec: string = path.join(__dirname, './api/api-spec.yaml');

const authServiceApp = configureApp({
  apiOptions: {
    apiSpec,
    specType: 'openapi',
  },
  setup: (app) => {
    app.use(ENDPOINTS.HEALTH, healthRouter);
    app.use(ENDPOINTS.AP_LOGIN, alcumusPlatformLoginRouter);
    app.use(ENDPOINTS.LOGIN, loginRouter);
    app.use(ENDPOINTS.REFRESH, refreshTokenRouter);
    app.use(ENDPOINTS.LOGOUT, logoutRouterV1);
  },
});

export default authServiceApp;
