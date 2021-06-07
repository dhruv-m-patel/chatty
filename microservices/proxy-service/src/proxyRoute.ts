import express, { Router, Request, Response } from 'express';
import {
  retrieveCollection,
  ServiceMeshEndpoint,
} from '@alcumus/service-mesh-plugin';
import { RequestContext } from '@alcumus/express-middlewares';

const proxyRouter: Router = express.Router();

proxyRouter.get('/', async (request: Request, res: Response) => {
  const context = RequestContext.get(request);
  const result = await retrieveCollection<object>({
    endpoint: ServiceMeshEndpoint.USERS,
    routePath: '/v1/users',
    context,
  });
  res.status(result.status).json(result.data);
});

export default proxyRouter;
