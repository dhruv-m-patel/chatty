import {
  getExternalToInternalIdMapping,
  PlatformData,
  retrieveEntitiesFromPlatform,
} from './helpers';
import { transformAndLoadCompany } from '../extractors/platformCompany';
import { transformAndSaveEmployeeRole } from '../extractors/platformRole';
import { transformAndSaveCompanySite } from '../extractors/platformCompanySite';
import RecordMap from '../extractors/recordMap';
import { transformAndSaveEmployee } from '../extractors/platformEmployee';
import { getUsers, UserSeed } from './userData';

async function seedCompanyAndCompanySites(extractedEntities: PlatformData) {
  const companies = await Promise.all(
    extractedEntities.companies.map(transformAndLoadCompany)
  );
  const companyId = companies[0]._id;
  const companySites = await Promise.all(
    extractedEntities.sites.map((site) =>
      transformAndSaveCompanySite(site, companyId)
    )
  );
  return { companyId, companies, companySites };
}

export async function extractTransformAndLoadEntitiesFromAlcumusPlatform() {
  const extractedEntities = await retrieveEntitiesFromPlatform('');

  // seed company, company address, and company sites
  const {
    companyId,
    companies,
    companySites,
  } = await seedCompanyAndCompanySites(extractedEntities);

  // seed employee roles
  const employeeRoles = await Promise.all(
    extractedEntities.roles.map((role) =>
      transformAndSaveEmployeeRole(role, companyId)
    )
  );

  // seed users
  const roles: RecordMap = getExternalToInternalIdMapping(employeeRoles);
  const sites: RecordMap = getExternalToInternalIdMapping(companySites);
  const userData: UserSeed[] = getUsers();
  const userIdsByEmail = userData.reduce((aggregate: RecordMap, user) => {
    aggregate[user.email] = user._id;
    return aggregate;
  }, {});

  const users = await Promise.all(
    extractedEntities.employees
      .filter((employee) => !!userIdsByEmail[employee.email])
      .map((employee) =>
        transformAndSaveEmployee({
          employee,
          userIdsByEmail,
          roles,
          sites,
          companyId,
        })
      )
  );

  return {
    companies,
    employeeRoles,
    companySites,
    users,
  };
}
