import {
  CompanyFilterFactory,
  getCrudEntityRouter,
  CrudEntityRetriever,
} from '@alcumus/express-middlewares';
import EmployeeRoleModel, {
  EMPLOYEE_ROLE_MODEL_NAME,
  EmployeeRoleDocument,
} from '../models/employeeRole';

const retriever = new CrudEntityRetriever(
  EmployeeRoleModel,
  EMPLOYEE_ROLE_MODEL_NAME,
  new CompanyFilterFactory()
);

const employeeRoleRouterV1 = getCrudEntityRouter<EmployeeRoleDocument>({
  retriever,
});

export default employeeRoleRouterV1;
