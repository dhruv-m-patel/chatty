import {
  SoftDeletableEntity,
  SchemaChain,
  BaseEntityDocument,
} from '@alcumus/mongoose-lib';
import { Schema, model, Model } from 'mongoose';

export const STREET_ADDRESS_MODEL_NAME = 'WF_Street_Address';

export interface StreetAddress extends SoftDeletableEntity {
  addressLines: string[];
  city: string;
  provinceState: string;
  country: string;
}

export interface StreetAddressDocument
  extends BaseEntityDocument,
    StreetAddress {}

const schema: Schema = SchemaChain.newBuilder()
  .withSoftDelete()
  .withMoreFields({
    addressLines: {
      type: Array,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    provinceState: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: true,
    },
  })
  .build();

const StreetAddressModel: Model<StreetAddressDocument> = model(
  STREET_ADDRESS_MODEL_NAME,
  schema
);
export default StreetAddressModel;
