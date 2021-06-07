import { getCompanyId } from './helpers';
import { Request } from 'express';

export interface CrudFilterFactory {
  getFilter(request: Request, moreFilters: object): Promise<object>;
}

export class CompanyFilterFactory implements CrudFilterFactory {
  async getFilter(request: Request, moreFilters: object): Promise<object> {
    return {
      ...moreFilters,
      _deleted: false,
      companyId: await getCompanyId(request),
    };
  }
}
