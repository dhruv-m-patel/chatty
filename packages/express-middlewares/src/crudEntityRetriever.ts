import { Request } from 'express';
import { SoftDeletableEntity, BaseEntityDocument } from '@alcumus/mongoose-lib';
import { Model } from 'mongoose';
import { CrudFilterFactory } from './crudFilterFactory';

export default class CrudEntityRetriever<
  TModelType extends SoftDeletableEntity & BaseEntityDocument
> {
  private _model: Model<TModelType>;
  private _entityName: string;
  private _filterFactory: CrudFilterFactory;

  public constructor(
    model: Model<TModelType>,
    entityName: string,
    filterFactory: CrudFilterFactory
  ) {
    this._model = model;
    this._entityName = entityName;
    this._filterFactory = filterFactory;
  }

  async getCollection(request: Request): Promise<TModelType[]> {
    const filter: object = await this._filterFactory.getFilter(request, {});
    return this._model.find(filter);
  }

  async getOne(request: Request, id: string): Promise<TModelType | null> {
    const filter: object = await this._filterFactory.getFilter(request, {
      _id: id,
    });
    return await this._model.findOne(filter);
  }

  async search(request: Request, bodyFilter: object): Promise<TModelType[]> {
    const filter: object = await this._filterFactory.getFilter(
      request,
      bodyFilter
    );
    return this._model.find(filter);
  }
}
