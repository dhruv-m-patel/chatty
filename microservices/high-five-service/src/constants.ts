import { ProcessEnv } from '@alcumus/express-app';

export const BASE_PATH = '/api';

export const BASE_PATH_V1 = `${BASE_PATH}/v1`;

export const ENDPOINTS = {
  HEALTH: `${BASE_PATH}/health`,
  HIGH_FIVE: `${BASE_PATH_V1}/highfive`,
  HIGH_FIVE_TYPES: `${BASE_PATH_V1}/highfivetypes`,
};

const baseUrl =
  ProcessEnv.getValue('MONGO_DB_URL') || 'mongodb://127.0.0.1:27017';
const databaseName =
  ProcessEnv.getValue('HIGH_FIVE_MONGO_DB_NAME') || 'highfive';

export const HIGH_FIVE_SERVICE_DB_URL = `${baseUrl}/${databaseName}`;
export const HIGH_FIVE_SERVICE_PORT =
  Number(ProcessEnv.getValue('HIGH_FIVE_SERVICE_PORT')) || 8011;

export const SERVICE_MESH = {
  HOST: ProcessEnv.getValueOrDefault(
    'SERVICE_MESH_HOST',
    'http://localhost:8000/'
  ),
};
