import axios from 'axios';
import {
  AlcumusPlatformApiResponse,
  AlcumusPlatformApiResult,
} from '@alcumus/platform-extractors';
import { LoginRequest, StandardLoginToken } from '../types';
import { ProcessEnv } from '@alcumus/express-app';
import { Request, Response } from 'express';

export const UNAUTHENTICATED_RESPONSE_MESSAGE = '401:Unauthorised';

export const PLATFORM_UNAVAILABLE_ERROR = {
  message: 'Alcumus Platform was not available',
};

export async function loginWithAlcumusPlatform(
  username: string,
  password: string
): Promise<AlcumusPlatformApiResult<StandardLoginToken>> {
  const endpoint = ProcessEnv.getValueOrThrow('ALCUMUS_PLATFORM_URL');
  const data = {
    username,
    password,
    type: 'authentication.login',
  };

  const options = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    validateStatus: null,
  };

  const result = await axios.post(`${endpoint}/process`, data, options);
  const status =
    result.data !== UNAUTHENTICATED_RESPONSE_MESSAGE ? result.status : 401;
  return {
    status,
    data: result.data,
  };
}

export async function handleLoginViaPassThrough(
  request: Request,
  response: Response,
  toResponse: (
    responseBody: AlcumusPlatformApiResponse<StandardLoginToken>
  ) => object
) {
  const { username, password }: LoginRequest = request.body;

  const {
    status,
    data,
  }: AlcumusPlatformApiResult<StandardLoginToken> = await loginWithAlcumusPlatform(
    username,
    password
  );
  if (status >= 404) {
    console.error(
      `Alcumus Platform login for user ${username} failed with status ${status}, data: ${JSON.stringify(
        data
      )}`
    );
    response.status(500).json(PLATFORM_UNAVAILABLE_ERROR);
  } else if (status >= 400) {
    response.status(status).json(data);
  } else {
    response.json(toResponse(data));
  }
}
