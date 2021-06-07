import RecordMap from '../extractors/recordMap';
import { AlcumusEmployee } from '../extractors/platformEmployee';
import { AlcumusPlatformRole } from '../extractors/platformRole';
import { AlcumusCompanySite } from '../extractors/platformCompanySite';
import { AlcumusCompany } from '../extractors/platformCompany';
import { BaseEntityDocument, ImportableEntity } from '@alcumus/mongoose-lib';
import { API_KEY, ROUTES } from './seedConfig';
import { retrieveEntities } from '@alcumus/platform-extractors';

export function getExternalToInternalIdMapping(
  collection: (ImportableEntity & BaseEntityDocument)[]
): RecordMap {
  return collection.reduce((aggregate: RecordMap, importedEntity) => {
    const id = importedEntity._id;
    const externalId = importedEntity._externalId;
    if (!externalId) {
      throw new Error(
        `Seed Role: ${typeof importedEntity} ${id} has external id ${externalId}`
      );
    }
    aggregate[externalId] = id;
    return aggregate;
  }, {});
}

export interface PlatformData {
  employees: AlcumusEmployee[];
  roles: AlcumusPlatformRole[];
  sites: AlcumusCompanySite[];
  companies: AlcumusCompany[];
}

export async function retrieveEntitiesFromPlatform(
  origin: string
): Promise<PlatformData> {
  const [employees, roles, sites, companies] = await Promise.all(
    Object.values(ROUTES).map((route) =>
      retrieveEntities({
        route,
        apiKey: API_KEY,
        origin,
      })
    )
  );

  return {
    employees: employees as AlcumusEmployee[],
    roles: roles as AlcumusPlatformRole[],
    sites: sites as AlcumusCompanySite[],
    companies: companies as AlcumusCompany[],
  };
}
