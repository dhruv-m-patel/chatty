export interface EntityHistoryDocument {
  _id: string;
  trackedEntityId: string;
  changedBy: string;
  changedOn: Date;
  version: number;
  operation: string;
  changedFields: Array<ChangedField>;
  entityType: string;
  _modifiedOn: Date;
  _modifiedBy: string;
  _createdOn: Date;
  _createdBy: string;
}

interface ChangedField {
  fieldName: string;
  oldValue: Array<string> | Date | object | string | number | boolean | null;
  newValue: Array<string> | Date | object | string | number | boolean | null;
}

export function createDatabase(databaseName): string {
  return `CREATE DATABASE IF NOT EXISTS ${databaseName}`;
}

export function createTable(): string {
  return "CREATE TABLE IF NOT EXISTS history (_id VARCHAR(40) NOT NULL DEFAULT (UUID()),_modifiedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,_modifiedBy varchar(255) DEFAULT '@System',_createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,_createdBy varchar(255) DEFAULT '@System',trackedEntityId varchar(255),changedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,changedBy varchar(255),version INT NOT NULL DEFAULT 0,operation varchar(55),entityType varchar(255),changedFields JSON)";
}
