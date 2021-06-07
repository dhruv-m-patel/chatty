import {
  ServiceMeshRequestParameters,
  ServiceMeshRequestResult,
  ServiceMeshSearchParameters,
} from './types';
import axios from 'axios';
import { ProcessEnv } from '@alcumus/express-app';

function getServiceMeshUrl() {
  return ProcessEnv.getValueOrDefault(
    'SERVICE_MESH_HOST',
    'http://localhost:4140/api'
  );
}

export async function retrieveCollection<T>({
  endpoint,
  routePath,
  context,
}: ServiceMeshRequestParameters): Promise<ServiceMeshRequestResult<T[]>> {
  const url = `${getServiceMeshUrl()}${routePath}`;
  const config = {
    validateStatus: null,
    headers: {
      Authorization: context.authorizationToken,
      'X-userinfo': context.encodedUserinfo,
      accept: 'application/json',
      Host: endpoint,
    },
  };
  const result = await axios.get(url, config);
  return {
    status: result.status,
    data: result.data.documents,
  };
}

export async function searchCollection<T>(
  request: ServiceMeshSearchParameters
): Promise<ServiceMeshRequestResult<T[]>> {
  const url = `${getServiceMeshUrl()}${request.routePath}`;
  const context = request.context;
  const config = {
    validateStatus: null,
    headers: {
      Authorization: context.authorizationToken,
      'X-userinfo': context.encodedUserinfo,
      accept: 'application/json',
      Host: request.endpoint,
    },
  };
  const result = await axios.post(url, request.searchFilter, config);
  return {
    status: result.status,
    data: result.data.documents,
  };
}

export async function retrieveEntity<T>({
  endpoint,
  routePath,
  context,
}: ServiceMeshRequestParameters): Promise<ServiceMeshRequestResult<T>> {
  const url = `${getServiceMeshUrl()}${routePath}`;
  const config = {
    validateStatus: null,
    headers: {
      Authorization: context.authorizationToken,
      'X-userinfo': context.encodedUserinfo,
      accept: 'application/json',
      Host: endpoint,
    },
  };
  const result = await axios.get(url, config);
  return {
    status: result.status,
    data: result.data,
  };
}
