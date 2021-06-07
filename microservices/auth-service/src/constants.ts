import { ProcessEnv } from '@alcumus/express-app';

export const V1_BASE_PATH = '/api/v1';

export const ENDPOINTS = {
  AP_LOGIN: `${V1_BASE_PATH}/login/passthrough`,
  LOGIN: `${V1_BASE_PATH}/login`,
  REFRESH: `${V1_BASE_PATH}/refresh`,
  LOGOUT: `${V1_BASE_PATH}/logout`,
  HEALTH: '/api/health',
};

export function getKeycloakConstants() {
  return {
    URL: ProcessEnv.getValue('AUTH_SERVICE_KEYCLOAK_SERVER_URL') || '',
    REALM: ProcessEnv.getValue('AUTH_SERVICE_KEYCLOAK_REALM') || '',
    CLIENT_ID: ProcessEnv.getValue('AUTH_SERVICE_KEYCLOAK_CLIENT_ID') || '',
    CLIENT_SECRET:
      ProcessEnv.getValue('AUTH_SERVICE_KEYCLOAK_CLIENT_SECRET') || '',
    ADMIN_ID: ProcessEnv.getValue('AUTH_SERVICE_KEYCLOAK_ADMIN_ID') || '',
    ADMIN_SECRET:
      ProcessEnv.getValue('AUTH_SERVICE_KEYCLOAK_ADMIN_SECRET') || '',
  };
}
