import { ProcessEnv } from '@alcumus/express-app';

const baseUrl =
  ProcessEnv.getValue('MONGO_DB_URL') || 'mongodb://127.0.0.1:27017';
const databaseName = ProcessEnv.getValue('USERS_MONGO_DB_NAME') || 'users';

export const USER_SERVICE_DB_URL = `${baseUrl}/${databaseName}`;
export const USER_SERVICE_PORT =
  Number(ProcessEnv.getValue('USERS_SERVICE_PORT')) || 8012;

export const BASE_PATH_V1 = '/api/v1';
export const ENDPOINTS = {
  HEALTH: `/api/health`,
  USERS: `${BASE_PATH_V1}/users`,
  SITES: `${BASE_PATH_V1}/sites`,
  ROLES: `${BASE_PATH_V1}/roles`,
  COMPANIES: `${BASE_PATH_V1}/companies`,
};
