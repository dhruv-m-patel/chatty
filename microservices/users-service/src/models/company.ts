import {
  SoftDeletableEntity,
  ImportableEntity,
  SchemaChain,
  ForeignKeyType,
  BaseEntityDocument,
} from '@alcumus/mongoose-lib';
import { model, Model, Schema } from 'mongoose';
import { STREET_ADDRESS_MODEL_NAME } from './streetAddress';

export const COMPANY_MODEL_NAME = 'WF_Company';

export interface Company extends ImportableEntity, SoftDeletableEntity {
  companyName: string;
  companyAddressId?: string;
  companyContactName?: string;
  companyContactEmail?: string;
  companyContactPhone?: string;
}

export interface CompanyDocument extends BaseEntityDocument, Company {}

const schema: Schema = SchemaChain.newBuilder()
  .withSoftDelete()
  .withExternalId()
  .withMoreFields({
    companyName: {
      type: String,
      required: true,
      unique: true,
    },
    companyAddressId: {
      type: ForeignKeyType,
      ref: STREET_ADDRESS_MODEL_NAME,
      required: false,
    },
    companyContactName: {
      type: String,
      required: false,
    },
    companyContactEmail: {
      type: String,
      required: false,
    },
    companyContactPhone: {
      type: String,
      required: false,
    },
  })
  .build();

const CompanyModel: Model<CompanyDocument> = model(COMPANY_MODEL_NAME, schema);
export default CompanyModel;
