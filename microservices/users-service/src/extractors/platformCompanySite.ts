import {
  AlcumusPlatformCustomApiItem,
  transformAndSaveApiItem,
} from '@alcumus/platform-extractors';
import CompanySiteModel, {
  CompanySite,
  CompanySiteDocument,
} from '../models/companySite';

export interface AlcumusCompanySite extends AlcumusPlatformCustomApiItem {
  org: string;
  siteName: string;
  description: string;
}

export async function transformAndSaveCompanySite(
  toTransform: AlcumusCompanySite,
  companyId: string
): Promise<CompanySiteDocument> {
  return await transformAndSaveApiItem<
    AlcumusCompanySite,
    CompanySite,
    CompanySiteDocument
  >(toTransform, CompanySiteModel, (apiItem: AlcumusCompanySite) => ({
    companyId: companyId,
    companySiteAddressId: null,
    companySiteName: apiItem.siteName,
    description: apiItem.description,
    parentCompanySiteId: null,
    _externalId: apiItem._id,
    _deleted: false,
  }));
}
