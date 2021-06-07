import CompanyModel, { CompanyDocument } from '../../../src/models/company';
import CompanySiteModel, {
  CompanySiteDocument,
} from '../../../src/models/companySite';
import EmployeeRoleModel, {
  EmployeeRoleDocument,
} from '../../../src/models/employeeRole';
import UserModel, { UserDocument } from '../../../src/models/user';

export async function createCompany(
  uniqueId: number
): Promise<CompanyDocument> {
  return CompanyModel.create({
    companyName: `TestCompany ${uniqueId}`,
  });
}

export async function createCompanySite(
  companyId: string
): Promise<CompanySiteDocument> {
  return await CompanySiteModel.create({
    companySiteName: 'integration test',
    description: 'has fully connected model with 1 ee',
    companySiteAddressId: null,
    parentCompanySiteId: null,
    companyId: companyId,
  });
}

export async function createEmployeeRole(
  companyId: string
): Promise<EmployeeRoleDocument> {
  return await EmployeeRoleModel.create({
    roleName: 'employee',
    description: 'has exciting career in testing',
    companyId: companyId,
  });
}

export async function createEmployee({
  uniqueId,
  companyId,
  roleId,
  siteId,
}: {
  uniqueId: number;
  companyId: string;
  roleId: string;
  siteId: string;
}): Promise<UserDocument> {
  return await UserModel.create({
    email: `john.doe.${uniqueId}@email.com`,
    isSystemUser: false,
    givenNames: 'John',
    lastName: 'Doe',
    phoneNumber: '403-256-2342',
    isActive: true,
    roleId: roleId,
    companyId: companyId,
    primaryCompanySiteId: siteId,
  });
}
