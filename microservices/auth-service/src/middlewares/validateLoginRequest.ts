import { validationHandler, expressValidator } from '@alcumus/express-app';

export default function (userNameField = 'username') {
  return [
    expressValidator
      .body('password', 'auth.login.passwordDoesNotExist')
      .exists()
      .isString()
      .notEmpty(),
    expressValidator
      .body(userNameField, 'auth.login.userNameDoesNotExist')
      .exists()
      .isString()
      .notEmpty()
      .bail(),
    expressValidator
      .body(userNameField, 'auth.login.userNameIsNotEmail')
      .isEmail(),
    validationHandler(401),
  ];
}
