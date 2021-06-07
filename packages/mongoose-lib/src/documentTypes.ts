import { Document } from 'mongoose';

export interface CompanyBoundEntity {
  companyId: string;
}

export interface ImportableEntity {
  _externalId?: string;
}

export interface BaseEntity {
  _id: string;
  _createdOn: Date;
  _createdBy: string;
  _modifiedOn: Date;
  _modifiedBy: string;
}

export interface SoftDeletableEntity {
  _deleted: boolean;
}

export interface BaseEntityDocument extends Document, BaseEntity {
  _id: string;
}
