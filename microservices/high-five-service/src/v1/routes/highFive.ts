import express, { Request, Response } from 'express';
import highFiveModel, { HighFiveDocument } from '../models/highFive';
import {
  getEmployeeId,
  RequestContext,
  RequestContextBinding,
} from '@alcumus/express-middlewares';
import { getSummarizedHighFive, SummarizedHighFive } from './utils';
import highFiveTypeModel, {
  HighFiveTypeDocument,
} from '../models/highFiveType';
import {
  buildMetaData,
  buildResponse,
  GenericValidationError,
  getPaginationQueryParams,
} from '@alcumus/response-utils';
import validateHighFive from '../../middlewares/validateHighFive';
import {
  searchCollection,
  ServiceMeshEndpoint,
} from '@alcumus/service-mesh-plugin';

const highFiveRouter = express.Router();

async function getInvalidTypes(types: Array<string>): Promise<Array<string>> {
  const returnArray: Array<string> = [];
  const result: Array<Array<HighFiveTypeDocument>> = await Promise.all(
    types.map((type) => highFiveTypeModel.find({ _deleted: false, _id: type }))
  );
  result.forEach((highFiveType, index) => {
    if (highFiveType.length === 0) returnArray.push(types[index]);
  });
  return returnArray;
}

interface User {
  _id: string;
}

async function getInvalidUsers(
  userIds: Array<string>,
  context: RequestContextBinding
): Promise<Array<string>> {
  const returnArray: Array<string> = [];

  const result = await searchCollection<User>({
    endpoint: ServiceMeshEndpoint.USERS,
    routePath: '/v1/users/search',
    context,
    searchFilter: { where: { _id: { $in: userIds } } },
  });

  userIds.forEach((userId) => {
    const index: number = result.data.findIndex(
      (validUser: User) => validUser._id === userId
    );
    if (index === -1) returnArray.push(userId);
  });

  return returnArray;
}

function buildErrors(
  errorsList: Array<string>,
  message: string,
  key: string
): Array<GenericValidationError> {
  const errors: Array<GenericValidationError> = [];
  errorsList.forEach((type) => {
    errors.push({ message: `${message}, ${type}`, key });
  });
  return errors;
}

highFiveRouter.get('/', async (req: Request, res: Response) => {
  const filter = { _deleted: false };
  const { page = 1, pageSize = 10, skip = 0 } = getPaginationQueryParams(
    req.query
  );
  const currentUserId = getEmployeeId(req);

  // @ts-ignore:disable-next-line
  const result: HighFiveDocument[] = await highFiveModel
    .find(filter)
    .skip(skip)
    .limit(pageSize)
    .sort({ _createdOn: -1 });
  const count = await highFiveModel.countDocuments({ _deleted: false });

  const metadata = buildMetaData({
    count,
    page,
    pageSize,
    currentPageSize: result.length,
  });

  const modifiedResult: Array<SummarizedHighFive> = result.map(
    (highFive: HighFiveDocument) =>
      getSummarizedHighFive(highFive, currentUserId)
  );
  res.json(
    buildResponse<SummarizedHighFive>({
      response: modifiedResult,
      metadata,
    })
  );
});

highFiveRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = getEmployeeId(req);
  const result: HighFiveDocument | null = await highFiveModel.findOne({
    _id: id,
    _deleted: false,
  });
  if (!result) {
    res.status(404).json({ message: 'High Five not found' });
    return;
  }
  const modifiedRes = getSummarizedHighFive(result, currentUserId);
  res.json(modifiedRes);
});

highFiveRouter.put(
  '/:id',
  ...validateHighFive(),
  async (req: Request, res: Response) => {
    const newHighFive = req.body;
    const { id } = req.params;

    const currentUserId = getEmployeeId(req);
    const invalidTypes: Array<string> = await getInvalidTypes(
      newHighFive.types
    );
    if (invalidTypes.length > 0) {
      const errors: Array<GenericValidationError> = buildErrors(
        invalidTypes,
        'Invalid high five types',
        'HighFiveType'
      );
      res.status(400).json(
        buildResponse<undefined>({ errors, message: 'Bad Request' })
      );
      return;
    }
    const invalidUsers: Array<string> = await getInvalidUsers(
      newHighFive.assignees,
      RequestContext.get(req)
    );
    if (invalidUsers.length > 0) {
      const errors: Array<GenericValidationError> = buildErrors(
        invalidUsers,
        'Invalid high five assignees',
        'HighFiveAssignees'
      );
      res.status(400).json(
        buildResponse<undefined>({ errors, message: 'Bad Request' })
      );
      return;
    }

    const existingHighFive: HighFiveDocument | null = await highFiveModel.findOne(
      { _deleted: false, _id: id }
    );

    if (!existingHighFive) {
      res.status(404).json({ message: 'High Five not found' });
      return;
    }

    const updateHighFive = {
      ...existingHighFive.toObject(),
      ...newHighFive,
      _modifiedBy: currentUserId,
      _modifiedOn: new Date(),
    };

    const result: HighFiveDocument | null = await highFiveModel.findByIdAndUpdate(
      id,
      updateHighFive,
      { runValidators: true, new: true }
    );
    if (!result) {
      res.status(404).json({ message: 'High Five not found' });
      return;
    }
    const modifiedResult: SummarizedHighFive = getSummarizedHighFive(
      result,
      currentUserId
    );
    res.json(modifiedResult);
  }
);

highFiveRouter.post(
  '/',
  ...validateHighFive(),
  async (req: Request, res: Response) => {
    const newhighFive: HighFiveDocument = req.body;
    const currentUserId = getEmployeeId(req);
    const invalidTypes: Array<string> = await getInvalidTypes(
      newhighFive.types
    );
    if (invalidTypes.length > 0) {
      const errors: Array<GenericValidationError> = buildErrors(
        invalidTypes,
        'Invalid high five types',
        'HighFiveType'
      );
      res.status(400).json(
        buildResponse<undefined>({ errors, message: 'Bad Request' })
      );
      return;
    }
    const invalidUsers: Array<string> = await getInvalidUsers(
      newhighFive.assignees,
      RequestContext.get(req)
    );
    if (invalidUsers.length > 0) {
      const errors: Array<GenericValidationError> = buildErrors(
        invalidUsers,
        'Invalid high five assignees',
        'HighFiveAssignees'
      );
      res.status(400).json(
        buildResponse<undefined>({ errors, message: 'Bad Request' })
      );
      return;
    }

    const finalHighFive = { ...newhighFive };
    finalHighFive._modifiedBy = currentUserId;
    finalHighFive._createdBy = currentUserId;
    const result: HighFiveDocument = await highFiveModel.create(finalHighFive);
    const modifiedResult = getSummarizedHighFive(result, currentUserId);
    res.setHeader('Location', `/highfive/${modifiedResult._id}`);
    res.status(201).json(modifiedResult);
  }
);

highFiveRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = getEmployeeId(req);
  const filter = { _id: id, _deleted: false };

  const highFive: HighFiveDocument | null = await highFiveModel.findOne(filter);
  if (!highFive) {
    res.status(404).json({ message: 'High Five not found' });
    return;
  }

  const updatedHighFive = { ...highFive.toObject() };
  updatedHighFive._modifiedOn = new Date();
  updatedHighFive._deleted = true;
  updatedHighFive._modifiedBy = currentUserId;

  await highFive.updateOne(updatedHighFive, { runValidators: true });

  res.sendStatus(204);
});

export default highFiveRouter;
