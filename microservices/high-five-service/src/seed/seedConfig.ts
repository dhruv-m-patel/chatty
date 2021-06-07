import { ProcessEnv } from '@alcumus/express-app';

export const ALCUMUS_PLATFORM_URL =
  ProcessEnv.getValue('ALCUMUS_PLATFORM_URL') || '';
const BASE_ROUTE = ProcessEnv.getValue('USERS_SERVICE_API_ROUTE') || '';

export const API_KEY =
  ProcessEnv.getValue('USERS_SERVICE_API_ACCESS_KEY') || '';

export const ROUTES = {
  HIGH_FIVE_TYPES: `${ALCUMUS_PLATFORM_URL}${BASE_ROUTE}/wf_high-five-type/list?fields=all`,
};
