import {
  CompanyBoundEntity,
  ImportableEntity,
  SchemaChain,
  BaseEntityDocument,
  SoftDeletableEntity,
} from '@alcumus/mongoose-lib';
import { Schema, model, Model } from 'mongoose';

export const EMPLOYEE_ROLE_MODEL_NAME = 'WF_Employee_Role';

export interface EmployeeRole
  extends CompanyBoundEntity,
    ImportableEntity,
    SoftDeletableEntity {
  roleName: string;
  description: string;
}

export interface EmployeeRoleDocument
  extends BaseEntityDocument,
    EmployeeRole {}

const schema: Schema = SchemaChain.newBuilder({
  roleName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
})
  .withCompanyId(true)
  .withExternalId()
  .withSoftDelete()
  .build();

const EmployeeRoleModel: Model<EmployeeRoleDocument> = model(
  EMPLOYEE_ROLE_MODEL_NAME,
  schema
);
export default EmployeeRoleModel;
