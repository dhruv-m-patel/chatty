import {
  getCrudEntityRouter,
  CrudEntityRetriever,
  CrudFilterFactory,
  getEmployeeId,
} from '@alcumus/express-middlewares';
import UserModel from '../models/user';
import CompanyModel, {
  COMPANY_MODEL_NAME,
  CompanyDocument,
} from '../models/company';
import { Request } from 'express';

class CompanyAccessFilterFactory implements CrudFilterFactory {
  async getFilter(request: Request, moreFilters: object): Promise<object> {
    const userId = getEmployeeId(request);
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error(`Could not find user with id ${userId}`);
    }

    return {
      ...moreFilters,
      _deleted: false,
      _id: user.companyId,
    };
  }
}

const factory: CrudFilterFactory = new CompanyAccessFilterFactory();

const retriever = new CrudEntityRetriever(
  CompanyModel,
  COMPANY_MODEL_NAME,
  factory
);

// in the future, we may support a multi-company admin
// but for now this only returns the current company when GET /companies is called.
const companyRouterV1 = getCrudEntityRouter<CompanyDocument>({
  retriever,
});

export default companyRouterV1;
