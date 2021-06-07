import { AlcumusPlatformCustomApiItem } from './types';
import { Model } from 'mongoose';
import {
  SoftDeletableEntity,
  SeedRecordCreator,
  BaseEntityDocument,
  ImportableEntity,
  BaseEntity,
} from '@alcumus/mongoose-lib';

export interface TransformOptions {
  companyId?: string;
  systemUserId?: string;
}

export async function transformAndSaveApiItem<
  TData extends AlcumusPlatformCustomApiItem,
  TEntity extends SoftDeletableEntity & ImportableEntity,
  TModelType extends BaseEntityDocument & TEntity
>(
  apiItem: TData,
  model: Model<TModelType>,
  extractor: (item: TData) => TEntity
): Promise<TModelType> {
  const toSave: TEntity = extractor(apiItem);

  const id = getBaseId(toSave._externalId) || getBaseId(apiItem._id) || '';

  const savedDocument: TEntity & BaseEntity = {
    ...toSave,
    _id: id,
    _createdBy: SeedRecordCreator,
    _modifiedBy: SeedRecordCreator,
    _createdOn: new Date(),
    _modifiedOn: new Date(),
    _deleted: false,
  };

  return model.findByIdAndUpdate(id, savedDocument as never, {
    upsert: true,
    new: true,
  });
}

export function getBaseId(
  primaryKey: string | null | undefined
): string | null {
  if (!primaryKey) {
    return null;
  }
  return primaryKey.split(':')[0];
}
