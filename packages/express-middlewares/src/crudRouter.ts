import express, { Request, Response } from 'express';
import { buildResponse } from '@alcumus/response-utils';

import { BaseEntityDocument, SoftDeletableEntity } from '@alcumus/mongoose-lib';
import CrudEntityRetriever from './crudEntityRetriever';
import SoftDeletableEntityUpserter from './crudUpsertor';
import { PaginatedDocumentsResponse } from './types';

export default function getCrudEntityRouter<
  TModelType extends SoftDeletableEntity & BaseEntityDocument
>({
  retriever,
  creator,
  updater,
}: {
  retriever: CrudEntityRetriever<TModelType> | null;
  creator?: SoftDeletableEntityUpserter<TModelType>;
  updater?: SoftDeletableEntityUpserter<TModelType>;
}): express.IRouter {
  type TModelTypeOrNull = TModelType | null;

  const notFound = {
    message: 'Could not find entity',
  };

  const router = express.Router();

  if (retriever) {
    router.get('/', async (request: Request, response: Response) => {
      const collection = await retriever.getCollection(request);
      const result: PaginatedDocumentsResponse<TModelType> = {
        documents: collection,
      };
      response.json(result);
    });

    router.get('/:id', async (request: Request, response: Response) => {
      const result: TModelTypeOrNull = await retriever.getOne(
        request,
        request.params.id
      );
      if (!result) {
        response.status(404).json(notFound);
      } else {
        response.json(result);
      }
    });

    router.post('/search', async (request: Request, response: Response) => {
      const collection = await retriever.search(request, request.body.where);

      response.json(
        buildResponse<TModelType>({ response: collection })
      );
    });
  }

  // need to support validators, ie. that FKs point to real entities that belong
  // to the same company.
  if (creator) {
    router.post('/', async (request: Request, response: Response) => {
      const result: TModelTypeOrNull = await creator.create(request);
      if (!result) {
        response.status(404).json(notFound);
      } else {
        response.json(
          buildResponse<TModelType>({ response: [result] })
        );
      }
    });
  }

  // need to support validators, ie. that FKs point to real entities that belong
  // to the same company.
  if (updater) {
    router.put('/:id', async (request: Request, response: Response) => {
      const result: TModelTypeOrNull = await updater.update(request);
      if (!result) {
        response.status(404).json(notFound);
      } else {
        response.json(
          buildResponse<TModelType>({ response: [result] })
        );
      }
    });
  }

  return router;
}
