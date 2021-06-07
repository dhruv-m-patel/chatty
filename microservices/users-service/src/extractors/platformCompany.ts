import {
  AlcumusPlatformCustomApiItem,
  transformAndSaveApiItem,
} from '@alcumus/platform-extractors';
import CompanyModel, { Company, CompanyDocument } from '../models/company';
import StreetAddressModel, {
  StreetAddress,
  StreetAddressDocument,
} from '../models/streetAddress';

export interface AlcumusCompany extends AlcumusPlatformCustomApiItem {
  state: string;
  locale: string;
  status: string;
  country: string;
  orgLogo: string[];
  orgName: string;
  planType: string;
  postalCode: string;
  contactEmail: string;
  contactPhone: string;
  headOfficeCity: string;
  headOfficeAddress: string;
  website: string;
}

export async function transformAndLoadCompany(
  toTransform: AlcumusCompany
): Promise<CompanyDocument> {
  const streetAddress = await transformAndSaveApiItem<
    AlcumusCompany,
    StreetAddress,
    StreetAddressDocument
  >(toTransform, StreetAddressModel, (apiItem: AlcumusCompany) => ({
    addressLines: [apiItem.headOfficeAddress],
    city: apiItem.headOfficeCity,
    provinceState: apiItem.state,
    country: apiItem.country,
    _deleted: false,
  }));

  return await transformAndSaveApiItem<
    AlcumusCompany,
    Company,
    CompanyDocument
  >(toTransform, CompanyModel, (apiItem: AlcumusCompany) => ({
    companyName: apiItem.orgName,
    companyAddressId: streetAddress._id,
    companyContactName: 'Unknown',
    companyContactPhone: apiItem.contactPhone,
    companyContactEmail: apiItem.contactEmail,
    _externalId: apiItem._id,
    _deleted: false,
  }));
}
