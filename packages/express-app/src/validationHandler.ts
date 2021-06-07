import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// stubbed for now
const TRANSLATOR = ({ msg }: { msg: string }) => {
  return {
    key: msg,
    message: msg,
  };
};

export default function getValidationResultHandler(statusCode = 400) {
  return (request: Request, response: Response, next: Function) => {
    const result = validationResult(request).formatWith(TRANSLATOR);

    if (!result.isEmpty()) {
      return response.status(statusCode).json({ errors: result.mapped() });
    } else {
      return next();
    }
  };
}
