import { ProcessEnv } from '@alcumus/express-app';

export const ALCUMUS_PLATFORM_URL =
  ProcessEnv.getValue('ALCUMUS_PLATFORM_URL') || '';
const BASE_ROUTE = ProcessEnv.getValue('USERS_SERVICE_API_ROUTE') || '';

export const API_KEY =
  ProcessEnv.getValue('USERS_SERVICE_API_ACCESS_KEY') || '';

export const ROUTES = {
  USERS: `${ALCUMUS_PLATFORM_URL}${BASE_ROUTE}/wf_user/list?fields=all`,
  ROLES: `${ALCUMUS_PLATFORM_URL}${BASE_ROUTE}/wf_role/list?fields=all`,
  SITES: `${ALCUMUS_PLATFORM_URL}${BASE_ROUTE}/wf_site/list?fields=all`,
  CLIENTS: `${ALCUMUS_PLATFORM_URL}${BASE_ROUTE}/wf_client/list?fields=all`,
};
