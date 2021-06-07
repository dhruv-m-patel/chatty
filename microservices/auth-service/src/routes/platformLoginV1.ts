import express, { Router, Request, Response } from 'express';
import validateLoginRequest from '../middlewares/validateLoginRequest';
import { handleLoginViaPassThrough } from '../models/loginWithAlcumusPlatform';

const platformLoginRouter: Router = express.Router();

platformLoginRouter.post(
  '/',
  ...validateLoginRequest(),
  async (req: Request, res: Response): Promise<void> => {
    await handleLoginViaPassThrough(req, res, (data) => data);
  }
);

export default platformLoginRouter;
