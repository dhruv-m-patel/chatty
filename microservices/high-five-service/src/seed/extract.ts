import highFiveTypeModel, {
  HighFiveTypeDocument,
} from '../v1/models/highFiveType';
import {
  retrieveEntitiesFromPlatform,
  RecordMap,
  getExternalToInternalIdMapping,
  PlatformData,
} from './helpers';
import { AlcumusPlatformCustomApiItem } from '@alcumus/platform-extractors';
import { SeedRecordCreator } from '@alcumus/mongoose-lib';

export interface AlcumusPlatformHighFiveType
  extends AlcumusPlatformCustomApiItem {
  highFiveType: string;
}

function getBaseId(primaryKey) {
  if (!primaryKey) {
    return null;
  }
  return primaryKey.split(':')[0];
}

export async function transformAndSaveHighfiveType(
  highFiveType: AlcumusPlatformHighFiveType
): Promise<HighFiveTypeDocument> {
  const _externalId = getBaseId(highFiveType._id);
  const savedDocument = {
    _modifiedBy: SeedRecordCreator,
    _modifiedOn: new Date(),
    _deleted: false,
    name: highFiveType.highFiveType,
  };
  const existingDoc: HighFiveTypeDocument | null = await highFiveTypeModel.findOne(
    { name: highFiveType.highFiveType, _externalId, _deleted: false }
  );

  if (!existingDoc) {
    return highFiveTypeModel.create({
      ...savedDocument,
      _externalId,
      _createdBy: SeedRecordCreator,
      _createdOn: new Date(),
    });
  }

  return highFiveTypeModel.findOneAndUpdate(
    { _deleted: false, name: highFiveType.highFiveType },
    savedDocument,
    {
      upsert: true,
      new: true,
    }
  );
}

export async function extractTransformAndLoadEntitiesFromAlcumusPlatform() {
  const extractedEntities: PlatformData = await retrieveEntitiesFromPlatform(
    ''
  );

  const wfHighFiveTypes = await Promise.all(
    extractedEntities.highFiveTypes.map((highFiveType) =>
      // @ts-ignore: disable-next-line
      transformAndSaveHighfiveType(highFiveType)
    )
  );
  const highFiveTypes: RecordMap = getExternalToInternalIdMapping(
    wfHighFiveTypes
  );

  return highFiveTypes;
}
