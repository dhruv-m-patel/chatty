import express, { Request, Response } from 'express';
import highFiveTypeModel, {
  HighFiveTypeDocument,
} from '../models/highFiveType';
import { getEmployeeId } from '@alcumus/express-middlewares';
import {
  buildMetaData,
  buildResponse,
  GenericValidationError,
  getPaginationQueryParams,
} from '@alcumus/response-utils';

const highFiveTypeRouter = express.Router();

highFiveTypeRouter.get('/', async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, skip = 0 } = getPaginationQueryParams(
    req.query
  );

  const response: HighFiveTypeDocument[] = await highFiveTypeModel
    .find({ _deleted: false })
    .skip(skip)
    .limit(pageSize)
    .sort({ _createdOn: -1 });
  const count = await highFiveTypeModel.countDocuments({
    _deleted: false,
  });

  const metadata = buildMetaData({
    count,
    page,
    pageSize,
    currentPageSize: response.length,
  });

  res.json(
    buildResponse<HighFiveTypeDocument>({ response, metadata })
  );
});

highFiveTypeRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const result: HighFiveTypeDocument | null = await highFiveTypeModel.findOne({
    _id: id,
    _deleted: false,
  });
  if (!result) {
    res.status(404).json({ message: 'High Five Type not found' });
    return;
  }

  res.json(result);
});

highFiveTypeRouter.put('/:id', async (req: Request, res: Response) => {
  const newhighFiveType = req.body;
  const { id } = req.params;
  const filter = { _id: id, _deleted: false };
  const currentUserId = getEmployeeId(req);

  try {
    const existingHighFiveType: HighFiveTypeDocument | null = await highFiveTypeModel.findOne(
      { _deleted: false, _id: id }
    );

    if (!existingHighFiveType) {
      res.status(404).json({ message: 'High Five Type not found' });
      return;
    }

    const updateHighFiveType = {
      ...existingHighFiveType.toObject(),
      ...newhighFiveType,
    };
    updateHighFiveType._modifiedBy = currentUserId;
    updateHighFiveType._modifiedOn = new Date();
    await existingHighFiveType.updateOne(updateHighFiveType, {
      runValidators: true,
    });
    const result: HighFiveTypeDocument | null = await highFiveTypeModel.findOne(
      filter
    );

    if (!result) {
      res.status(404).json({ message: 'Hive Type update failed!' });
      return;
    }
    res.json(result);
    return;
  } catch (err) {
    if (err.name === 'ValidationError' || err.message.includes('dup key:')) {
      // with updateOne we get a mongo error
      const errors: Array<GenericValidationError> = [
        {
          message: 'High Five Type must be unique',
          key: 'HighFiveType.submit.HighFiveTypeMustBeUnique',
        },
      ];
      res.status(400).json(
        buildResponse<undefined>({ errors, message: err.name })
      );
    } else {
      console.error(err.message, err.stack);
      res.status(500).json({ message: err.message });
    }
  }
});

highFiveTypeRouter.delete('/:id', async (req: Request, res: Response) => {
  const currentUserId = getEmployeeId(req);
  const { id } = req.params;
  const filter = { _id: id, _deleted: false };
  const highFiveType: HighFiveTypeDocument | null = await highFiveTypeModel.findOne(
    filter
  );

  if (!highFiveType) {
    res.status(404).json({ message: 'High Five Type not found' });
    return;
  }

  const updatedHighFiveType = {
    ...highFiveType.toObject(),
    _modifiedOn: new Date(),
    _deleted: true,
    _modifiedBy: currentUserId,
  };

  await highFiveType.updateOne(updatedHighFiveType);

  res.sendStatus(204);
});

highFiveTypeRouter.post('/', async (req: Request, res: Response) => {
  const currentUserId = await getEmployeeId(req);
  const newHighFiveType: HighFiveTypeDocument = req.body;

  const finalHighFiveType = { ...newHighFiveType };
  finalHighFiveType._modifiedBy = currentUserId;
  finalHighFiveType._createdBy = currentUserId;

  try {
    const result: HighFiveTypeDocument = await highFiveTypeModel.create(
      finalHighFiveType
    );
    res.setHeader('Location', `/highfivetypes/${result._id}`);
    res.status(201).json(result);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors: Array<GenericValidationError> = [
        {
          message: 'High Five Type must be unique',
          key: 'HighFiveType.submit.HighFiveTypeMustBeUnique',
        },
      ];
      res.status(400).json(
        buildResponse<undefined>({ errors, message: err.name })
      );
    } else {
      console.error(err.message, err.stack);
      res.status(500).json({ message: err.message });
    }
  }
});

highFiveTypeRouter.post('/search', async (req: Request, res: Response) => {
  const ids: [] = req.body.ids;
  const highFiveTypes: HighFiveTypeDocument[] = await highFiveTypeModel
    .find({ _deleted: false })
    .where('_id')
    .in(ids);
  res.json(
    buildResponse<HighFiveTypeDocument>({ response: highFiveTypes })
  );
});

export default highFiveTypeRouter;
