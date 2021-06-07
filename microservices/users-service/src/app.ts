import path from 'path';
import { configureApp } from '@alcumus/express-app';
import { useRequestContext } from '@alcumus/express-middlewares';
import usersRouterV1 from './routes/usersV1';
import employeeRoleRouterV1 from './routes/employeeRolesV1';
import companyRouterV1 from './routes/companiesV1';
import companySiteRouterV1 from './routes/companySitesV1';
import healthRouter from './routes/health';
import { ENDPOINTS } from './constants';

const apiSpec: string = path.join(__dirname, './api/api-spec.yaml');

const usersServiceApp = configureApp({
  apiOptions: {
    apiSpec,
    specType: 'openapi',
  },
  setup: (app) => {
    app.use(useRequestContext);
    app.use(ENDPOINTS.HEALTH, healthRouter);
    app.use(ENDPOINTS.USERS, usersRouterV1);
    app.use(ENDPOINTS.SITES, companySiteRouterV1);
    app.use(ENDPOINTS.ROLES, employeeRoleRouterV1);
    app.use(ENDPOINTS.COMPANIES, companyRouterV1);
  },
});

export default usersServiceApp;
