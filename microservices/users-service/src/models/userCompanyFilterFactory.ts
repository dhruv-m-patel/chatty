import { CrudFilterFactory, getEmployeeId } from '@alcumus/express-middlewares';
import { Request } from 'express';
import UserModel from './user';

export class UserCompanyFilterFactory implements CrudFilterFactory {
  async getFilter(request: Request, moreFilters: object): Promise<object> {
    const userId = getEmployeeId(request);
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('No company associated with user');
    }
    return {
      ...moreFilters,
      _deleted: false,
      companyId: user.companyId,
    };
  }
}
