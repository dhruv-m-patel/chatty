import { Schema, model, Model } from 'mongoose';
import { STREET_ADDRESS_MODEL_NAME } from './streetAddress';
import {
  SchemaChain,
  SoftDeletableEntity,
  CompanyBoundEntity,
  ImportableEntity,
  BaseEntityDocument,
} from '@alcumus/mongoose-lib';

export const COMPANY_SITE_MODEL_NAME = 'WF_Company_Site';

export interface CompanySite
  extends CompanyBoundEntity,
    ImportableEntity,
    SoftDeletableEntity {
  companySiteName: string;
  description: string;
  companySiteAddressId: string | null;
  parentCompanySiteId: string | null;
}

export interface CompanySiteDocument extends BaseEntityDocument, CompanySite {}

const schema: Schema = SchemaChain.newBuilder()
  .withCompanyId(true)
  .withExternalId()
  .withSoftDelete()
  .withMoreFields({
    companySiteAddressId: {
      type: String,
      ref: STREET_ADDRESS_MODEL_NAME,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    companySiteName: {
      type: String,
      required: true,
    },
    parentCompanySiteId: {
      type: String,
      ref: COMPANY_SITE_MODEL_NAME,
      required: false,
    },
  })
  .build();

const CompanySiteModel: Model<CompanySiteDocument> = model(
  COMPANY_SITE_MODEL_NAME,
  schema
);
export default CompanySiteModel;
