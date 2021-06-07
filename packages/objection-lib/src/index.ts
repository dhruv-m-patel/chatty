import connectToKnex, { Knex } from 'knex';
import { Model } from 'objection';
import {
  BaseKnexEntity,
  CompanyKnexEntity,
  CompanySiteKnexEntity,
  ImportedKnexEntity,
  SoftDeletableKnexEntity,
} from './types';
import { BaseKnexEntityModel } from './baseEntityModel';
import { JsonSchemaBuilder } from './schemaBuilder';

export function connectToDatabase(config: Knex.Config) {
  const knex = connectToKnex(config);
  Model.knex(knex);
}

export {
  BaseKnexEntityModel,
  CompanySiteKnexEntity,
  CompanyKnexEntity,
  ImportedKnexEntity,
  JsonSchemaBuilder,
  BaseKnexEntity,
  SoftDeletableKnexEntity,
};
