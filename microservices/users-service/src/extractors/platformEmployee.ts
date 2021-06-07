import {
  AlcumusPlatformCustomApiItem,
  transformAndSaveApiItem,
} from '@alcumus/platform-extractors';
import RecordMap from './recordMap';
import UserModel, { UserEntity, UserDocument } from '../models/user';

export interface AlcumusEmployee extends AlcumusPlatformCustomApiItem {
  email: string;
  status: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;

  // ID Fields
  primarySite: string;
  role: string;
  supervisor: string;
}

export async function transformAndSaveEmployee({
  employee,
  userIdsByEmail,
  roles,
  sites,
  companyId,
}: {
  employee: AlcumusEmployee;
  userIdsByEmail: RecordMap;
  roles: RecordMap;
  sites: RecordMap;
  companyId: string;
}): Promise<UserDocument> {
  return await transformAndSaveApiItem<
    AlcumusEmployee,
    UserEntity,
    UserDocument
  >(employee, UserModel, (apiItem: AlcumusEmployee) => ({
    _externalId: userIdsByEmail[apiItem.email],
    email: apiItem.email,
    isSystemUser: false,
    givenNames: apiItem.firstName,
    lastName: apiItem.lastName,
    phoneNumber: apiItem.phoneNumber,
    isActive: apiItem.status === 'active' && !apiItem._deleted,
    primaryCompanySiteId: apiItem.primarySite && sites[apiItem.primarySite],
    roleId: apiItem.role && roles[apiItem.role],
    _deleted: false,
    companyId,
  }));
}
