import { validationHandler, expressValidator } from '@alcumus/express-app';

export default function () {
  return [
    expressValidator
      .body('assignees', 'highFive.submit.atLeastOneAssigneeMustExist')
      .exists()
      .isArray()
      .notEmpty(),
    expressValidator
      .body('types', 'highFive.submit.atLeastOneTypeMustExist')
      .exists()
      .isArray()
      .notEmpty(),
    expressValidator
      .body('description', 'highFive.submit.descriptionNotEmpty')
      .exists()
      .notEmpty(),
    validationHandler(),
  ];
}
