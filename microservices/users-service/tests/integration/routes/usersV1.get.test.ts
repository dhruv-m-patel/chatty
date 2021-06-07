import usersServiceApp from '../../../src/app';
import { ENDPOINTS, USER_SERVICE_DB_URL } from '../../../src/constants';
import { UserDocument } from '../../../src/models/user';
import { EmployeeRoleDocument } from '../../../src/models/employeeRole';
import { CompanySiteDocument } from '../../../src/models/companySite';
import { CompanyDocument } from '../../../src/models/company';
import connectToMongoose from '@alcumus/mongoose-lib';
import request from 'supertest';
import mongoose from 'mongoose';
import {
  createCompany,
  createCompanySite,
  createEmployee,
  createEmployeeRole,
} from './helpers';

const uniqueId = Date.now();

describe(`Integration Test: ${ENDPOINTS.USERS}`, () => {
  let companyId: string;
  let company: CompanyDocument;
  let role: EmployeeRoleDocument;
  let employee: UserDocument;
  let site: CompanySiteDocument;
  let token: string;
  let expectedUser: object;

  beforeAll(async () => {
    await connectToMongoose(USER_SERVICE_DB_URL)();
    company = await createCompany(uniqueId);
    companyId = company._id;
    role = await createEmployeeRole(companyId);
    site = await createCompanySite(companyId);
    employee = await createEmployee({
      uniqueId,
      companyId,
      roleId: role._id,
      siteId: site._id,
    });
    token = Buffer.from(
      JSON.stringify({ preferred_username: employee._id })
    ).toString('base64');

    expectedUser = {
      email: `john.doe.${uniqueId}@email.com`,
      isSystemUser: false,
      givenNames: 'John',
      lastName: 'Doe',
      phoneNumber: '403-256-2342',
      isActive: true,
      roleId: role._id,
      companyId: companyId,
      primaryCompanySiteId: site._id,
    };
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  function retrieveUsers(path: string) {
    return request(usersServiceApp).get(path).set('x-userinfo', token).send();
  }

  describe('GET /users', () => {
    it('returns a list of users', (done) => {
      retrieveUsers(ENDPOINTS.USERS)
        .expect((res) => {
          expect(res.body).toEqual({
            documents: [expect.objectContaining(expectedUser)],
          });
        })
        .expect(200, done);
    });
  });

  describe('GET /users/{id}', () => {
    it('returns a single user', (done) => {
      retrieveUsers(`${ENDPOINTS.USERS}/${employee._id}`)
        .expect((res) => {
          expect(res.body).toEqual(expect.objectContaining(expectedUser));
        })
        .expect(200, done);
    });
  });

  describe('POST /users/search', () => {
    function performSearch(body: object) {
      return request(usersServiceApp)
        .post(`${ENDPOINTS.USERS}/search`)
        .set('x-userinfo', token)
        .send(body);
    }

    it('returns a collection of users based on a single ID, limited to test company', (done) => {
      performSearch({
        where: {
          _id: {
            $in: [employee._id],
          },
        },
      })
        .expect((res) => {
          expect(res.body).toEqual({
            documents: [expect.objectContaining(expectedUser)],
            metadata: {
              current_page_size: null,
              page_number: null,
              page_size: null,
              total_documents_count: null,
              total_pages: null,
            },
          });
        })
        .expect(200, done);
    });

    it('returns a collection of users based on a site id, limited to test company', (done) => {
      performSearch({
        where: {
          primaryCompanySiteId: site._id,
        },
      })
        .expect((res) => {
          expect(res.body).toEqual({
            documents: [expect.objectContaining(expectedUser)],
            metadata: {
              current_page_size: null,
              page_number: null,
              page_size: null,
              total_documents_count: null,
              total_pages: null,
            },
          });
        })
        .expect(200, done);
    });
  });
});
