import express, { Router, Request, Response } from 'express';
import logout from '../keycloak/keycloakLogout';
import validateBodyHasRefreshToken from '../middlewares/validateBodyHasRefreshToken';

const logoutRouterV1: Router = express.Router();

logoutRouterV1.post(
  '/',
  ...validateBodyHasRefreshToken(),
  async (request: Request, response: Response): Promise<void> => {
    const { refreshToken } = request.body;
    const logoutResponse = await logout(refreshToken);
    if (logoutResponse.status >= 404) {
      console.error(
        `Logout Failed: received response with status code ${
          logoutResponse.status
        } and error ${JSON.stringify(logoutResponse.data)}`
      );
      response.status(500).send(logoutResponse.data);
    } else if (logoutResponse.status >= 400) {
      response.status(401).send(logoutResponse.data);
    } else if (logoutResponse.status >= 300) {
      response.setHeader('Location', logoutResponse.redirect);
      response.status(302);
    } else {
      response.json();
    }
  }
);

export default logoutRouterV1;
