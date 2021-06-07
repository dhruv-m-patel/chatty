import {
  getCrudEntityRouter,
  CrudEntityRetriever,
  getEmployeeId,
} from '@alcumus/express-middlewares';
import { Request } from 'express';
import UserModel, { USER_MODEL_NAME, UserDocument } from '../models/user';
import { Model } from 'mongoose';
import { UserCompanyFilterFactory } from '../models/userCompanyFilterFactory';

class UserRetriever extends CrudEntityRetriever<UserDocument> {
  constructor(model: Model<UserDocument>) {
    super(model, USER_MODEL_NAME, new UserCompanyFilterFactory());
  }

  async getOne(request: Request): Promise<UserDocument | null> {
    const currentUserId = getEmployeeId(request);
    const fetchId =
      request.params.id !== 'me' ? request.params.id : currentUserId;
    return super.getOne(request, fetchId);
  }
}

const retriever = new UserRetriever(UserModel);

const usersRouterV1 = getCrudEntityRouter<UserDocument>({
  retriever,
});

export default usersRouterV1;
