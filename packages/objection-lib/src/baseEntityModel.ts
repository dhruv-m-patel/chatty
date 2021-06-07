import { Model } from 'objection';
import { BaseKnexEntity } from 'src/types';

export class BaseKnexEntityModel extends Model implements BaseKnexEntity {
  _id!: string;
  _createdOn!: string;
  _createdBy!: string;
  _modifiedOn!: string;
  _modifiedBy!: string;

  get modifiedOn(): Date {
    return new Date(this._modifiedOn);
  }

  get createdOn(): Date {
    return new Date(this._createdOn);
  }

  $beforeInsert() {
    this._createdOn = new Date(Date.now()).toISOString();
  }

  $beforeUpdate() {
    this._modifiedOn = new Date(Date.now()).toISOString();
  }
}
