import {
  CompanyFilterFactory,
  getCrudEntityRouter,
  CrudEntityRetriever,
} from '@alcumus/express-middlewares';
import CompanySiteModel, {
  COMPANY_SITE_MODEL_NAME,
  CompanySiteDocument,
} from '../models/companySite';

const retriever = new CrudEntityRetriever(
  CompanySiteModel,
  COMPANY_SITE_MODEL_NAME,
  new CompanyFilterFactory()
);

const companySiteRouterV1 = getCrudEntityRouter<CompanySiteDocument>({
  retriever,
});

export default companySiteRouterV1;
