export interface ImportedKnexEntity {
  externalId?: string;
  externalSource?: string;
}

export interface CompanyKnexEntity {
  companyId: string;
}

export interface CompanySiteKnexEntity {
  siteId: string;
}

export interface SoftDeletableKnexEntity {
  _deleted: boolean;
  _deletedOn?: Date;
}

export interface BaseKnexEntity {
  _id: string;
  _createdOn: string;
  _createdBy: string;
  _modifiedOn: string;
  _modifiedBy: string;
}
