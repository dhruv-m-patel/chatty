import { validationHandler, expressValidator } from '@alcumus/express-app';

const JWT_REGEX = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
export default function validateBodyHasRefreshToken() {
  return [
    expressValidator
      .body('refreshToken', 'auth.token.validJwtRefreshTokenRequired')
      .exists()
      .isString()
      .matches(JWT_REGEX)
      .notEmpty(),
    validationHandler(401),
  ];
}
