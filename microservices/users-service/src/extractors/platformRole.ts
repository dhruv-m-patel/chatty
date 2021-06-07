import {
  AlcumusPlatformCustomApiItem,
  transformAndSaveApiItem,
} from '@alcumus/platform-extractors';
import EmployeeRoleModel, {
  EmployeeRole,
  EmployeeRoleDocument,
} from '../models/employeeRole';

export interface AlcumusPlatformRole extends AlcumusPlatformCustomApiItem {
  role: string;
  description: string;
}

export async function transformAndSaveEmployeeRole(
  employeeRole: AlcumusPlatformRole,
  companyId: string
): Promise<EmployeeRoleDocument> {
  return await transformAndSaveApiItem<
    AlcumusPlatformRole,
    EmployeeRole,
    EmployeeRoleDocument
  >(employeeRole, EmployeeRoleModel, (apiItem: AlcumusPlatformRole) => ({
    roleName: apiItem.role,
    description: apiItem.description,
    companyId,
    _externalId: apiItem._id,
    _deleted: false,
  }));
}
