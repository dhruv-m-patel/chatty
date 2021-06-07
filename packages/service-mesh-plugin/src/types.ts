import { RequestContextBinding } from '@alcumus/express-middlewares';

export enum ServiceMeshEndpoint {
  USERS = 'users',
}

export interface ServiceMeshRequestResult<T> {
  status: number;
  data: T;
}

export interface ServiceMeshRequestParameters {
  endpoint: ServiceMeshEndpoint;
  routePath: string;
  context: RequestContextBinding;
}

export interface ServiceMeshSearchParameters
  extends ServiceMeshRequestParameters {
  searchFilter: object;
}
