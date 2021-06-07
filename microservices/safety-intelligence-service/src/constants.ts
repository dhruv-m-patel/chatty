import { ProcessEnv } from '@alcumus/express-app';

export const BASE_PATH = '/api';
export const BASE_PATH_V1 = `${BASE_PATH}/v1`;
export const ENDPOINTS = {
  HEALTH: `${BASE_PATH}/health`,
};
export const SAFETY_INTELLIGENCE_SERVICE_PORT = Number(
  ProcessEnv.getValueOrDefault('SAFETY_INTELLIGENCE_SERVICE_PORT', '8014')
);
