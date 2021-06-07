import express, { Request, Response, Router } from 'express';
import validateLoginRequest from '../middlewares/validateLoginRequest';
import { handleLoginViaPassThrough } from '../models/loginWithAlcumusPlatform';

const loginRouter: Router = express.Router();

loginRouter.post(
  '/',
  ...validateLoginRequest(),
  async (req: Request, res: Response): Promise<void> => {
    await handleLoginViaPassThrough(req, res, (data) => data.client.data);
  }
);

export default loginRouter;
