import express, { Router } from 'express';
import { handleHealthCheck } from '@alcumus/express-app';

const healthRouter: Router = express.Router();

healthRouter.get('/', handleHealthCheck('Users Service'));

export default healthRouter;
