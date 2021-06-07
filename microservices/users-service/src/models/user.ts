import {
  BaseEntityDocument,
  CompanyBoundEntity,
  ForeignKeyType,
  ImportableEntity,
  SchemaChain,
  SoftDeletableEntity,
} from '@alcumus/mongoose-lib';
import { Schema, model, Model } from 'mongoose';
import { EMPLOYEE_ROLE_MODEL_NAME } from './employeeRole';
import { COMPANY_SITE_MODEL_NAME } from './companySite';

// note that this maps to hestia/users in Alcumus Platform, despite the name
export const USER_MODEL_NAME = 'WF_User';

export interface UserEntity
  extends ImportableEntity,
    SoftDeletableEntity,
    CompanyBoundEntity {
  email: string;
  isSystemUser: boolean;

  givenNames: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean;

  roleId: string;
  primaryCompanySiteId: string;
}

export interface UserDocument extends BaseEntityDocument, UserEntity {}

const schema: Schema = SchemaChain.newBuilder()
  .withExternalId()
  .withSoftDelete()
  .withCompanyId(true)
  .withMoreFields({
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    isSystemUser: {
      type: Boolean,
      required: true,
      default: () => false,
    },

    givenNames: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    roleId: {
      type: ForeignKeyType,
      ref: EMPLOYEE_ROLE_MODEL_NAME,
      required: false,
    },
    primaryCompanySiteId: {
      type: ForeignKeyType,
      ref: COMPANY_SITE_MODEL_NAME,
      required: false,
    },
  })
  .build();

const UserModel: Model<UserDocument> = model(USER_MODEL_NAME, schema);
export default UserModel;
