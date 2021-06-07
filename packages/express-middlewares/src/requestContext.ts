import { Request } from 'express';
import { extractCorrelationId, extractEmployeeId } from './helpers';

export class RequestContext {
  // in a WeakMap, an entry is removed once the last strong reference to
  // a given key is lost.  Hence, when the request is finished, garbage
  // collection will also remove the request and its context binding
  // from this weak map.
  static _bindings = new WeakMap<Request, RequestContextBinding>();

  static bind(req: Request): void {
    const ctx = createContextBinding(req);
    RequestContext._bindings.set(req, ctx);
  }

  static get(req: Request): RequestContextBinding {
    const binding = RequestContext._bindings.get(req);
    if (!binding) {
      throw new Error(
        'Request Context not available.  Please check that middleware was added'
      );
    }
    return binding;
  }
}

function createContextBinding(request: Request): RequestContextBinding {
  // todo remove this ts-ignore
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const requestId = request.id as string;
  return {
    requestId,
    userId: extractEmployeeId(request),
    encodedUserinfo: request.header('X-userinfo'),
    authorizationToken: request.header('Authorization'),
    correlationId: extractCorrelationId(request, requestId),
  };
}

export interface RequestContextBinding {
  requestId: string;
  correlationId: string;

  // this will be undefined if unauthenticated.
  userId?: string;
  authorizationToken?: string;
  encodedUserinfo?: string;
}
