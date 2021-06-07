import { ProcessEnv } from '@alcumus/express-app';

// lazy load all these when in use

export const BASE_PATH = '/api';
export const BASE_PATH_V1 = `${BASE_PATH}/v1`;
export const ENDPOINTS = {
  HEALTH: `${BASE_PATH}/health`,
  HISTORY: `${BASE_PATH_V1}/history`,
};
export const ENTITY_HISTORY_SERVICE_PORT =
  Number(ProcessEnv.getValue('ENTITY_HISTORY_SERVICE_PORT')) || 8040;
