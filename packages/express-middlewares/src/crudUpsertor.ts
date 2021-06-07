import { Request } from 'express';
import { BaseEntityDocument, SoftDeletableEntity } from '@alcumus/mongoose-lib';
import { Model } from 'mongoose';
import { getCompanyId, getEmployeeId } from './helpers';

// TODO: finish implementing this.
export default class SoftDeletableEntityUpserter<
  TModelType extends SoftDeletableEntity & BaseEntityDocument
> {
  private _model: Model<TModelType>;
  private _entityName: string;

  public constructor({
    model,
    entityName,
  }: {
    model: Model<TModelType>;
    entityName: string;
  }) {
    this._model = model;
    this._entityName = entityName;
  }

  async create(request: Request): Promise<TModelType> {
    const toCreate: TModelType = {
      ...request.body,
      companyId: getCompanyId(request),
      _createdBy: getEmployeeId(request),
      _modifiedBy: getEmployeeId(request),
    };
    return await this._model.create(toCreate);
  }

  async update(request: Request): Promise<TModelType> {
    const toCreate: TModelType = {
      ...request.body,
      companyId: getCompanyId(request),
      _createdBy: getEmployeeId(request),
      _modifiedBy: getEmployeeId(request),
    };
    return await this._model.create(toCreate);
  }
}
