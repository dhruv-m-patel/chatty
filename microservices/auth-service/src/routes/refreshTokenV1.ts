import express, { Router, Request, Response } from 'express';
import validateBodyHasRefreshToken from '../middlewares/validateBodyHasRefreshToken';
import getRefreshedToken from '../keycloak/tokenRefresher';
import transformToken from '../keycloak/tokenAdapter';

const refreshTokenRouter: Router = express.Router();

refreshTokenRouter.post(
  '/',
  ...validateBodyHasRefreshToken(),
  async (request: Request, response: Response): Promise<void> => {
    const keycloakResponse = await getRefreshedToken(request.body.refreshToken);
    if (keycloakResponse.status >= 404) {
      console.error(
        `Token Refresh Failed: received response with status code ${keycloakResponse.status} and error ${keycloakResponse.data}`
      );
      response.status(500).send({
        message: 'Could not refresh token, server error',
      });
    } else if (keycloakResponse.status >= 400) {
      response.status(401).send(keycloakResponse.data);
    } else {
      const now = new Date(Date.now());
      const refreshedToken = transformToken(keycloakResponse.data, now);
      response.json(refreshedToken);
    }
  }
);

export default refreshTokenRouter;
