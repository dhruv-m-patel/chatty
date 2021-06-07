import { API_KEY, ROUTES } from './seedConfig';
import { retrieveEntities } from '@alcumus/platform-extractors';

export interface PlatformData {
  highFiveTypes: object[];
}

export interface RecordMap {
  [key: string]: string;
}

export function getExternalToInternalIdMapping(collection: any[]): RecordMap {
  return collection.reduce((aggregate: RecordMap, importedEntity) => {
    const id = importedEntity._id;
    const externalId = importedEntity._externalId;
    aggregate[externalId] = id;
    return aggregate;
  }, {});
}

export async function retrieveEntitiesFromPlatform(
  origin: string
): Promise<PlatformData> {
  const [highFiveTypes] = await Promise.all(
    Object.values(ROUTES).map((route) =>
      retrieveEntities({
        route,
        apiKey: API_KEY,
        origin,
      })
    )
  );

  return {
    highFiveTypes,
  };
}
