import { Request } from 'express';
import {
  getDecodedUserInfo,
  getEmployeeId,
  getCompanyId,
  extractEmployeeId,
} from '../../src/helpers';
import messages from '../../src/messages.i18n';
import { mock, instance, when } from 'ts-mockito';
import { RequestContext } from '../../src';
const USER_ID = 'myUserId123';
const ENCODED = 'eyAicHJlZmVycmVkX3VzZXJuYW1lIjogIm15VXNlcklkMTIzIiB9';
const BAD_ENCODING = 'abc✓';
const COMPANY_ID = 'kAx4oWodX';

describe('Unit tests: express-middlewares/helpers.ts', () => {
  describe('getDecodedUserInfo', () => {
    it('returns expected object for encoded string', () => {
      const decoded = getDecodedUserInfo(ENCODED);
      expect(decoded).toEqual({
        preferred_username: USER_ID,
      });
    });

    it('returns empty object if not base 64 encoded object', () => {
      expect(getDecodedUserInfo(BAD_ENCODING)).toEqual({});
    });
  });

  describe('extractEmployeeId', () => {
    it('returns employee id if xuserinfo provided', () => {
      const mockReq = mock<Request>();
      when(mockReq.header('x-userinfo')).thenReturn(ENCODED);

      const request = instance(mockReq);
      const employeeId = extractEmployeeId(request);
      expect(employeeId).toEqual(USER_ID);
    });

    it('returns undefined if xuserinfo has bad encoding', () => {
      const mockReq = mock<Request>();
      when(mockReq.header('x-userinfo')).thenReturn(BAD_ENCODING);

      const request: Request = instance(mockReq);
      expect(extractEmployeeId(request)).toBeUndefined();
    });

    it('returns undefined if xuserinfo not present', () => {
      const mockReq = mock<Request>();
      when(mockReq.header('x-userinfo')).thenReturn(undefined);

      const request: Request = instance(mockReq);
      expect(extractEmployeeId(request)).toBeUndefined();
    });
  });

  describe('getEmployeeId', () => {
    it('returns value if in request context', () => {
      const mockRequest = mock<Request>();
      when(mockRequest.header('x-userinfo')).thenReturn(ENCODED);
      const request = instance(mockRequest);
      RequestContext.bind(request);

      expect(getEmployeeId(request)).toEqual(USER_ID);
    });
    it('throws exception if not in request context', () => {
      const mockRequest = mock<Request>();
      when(mockRequest.header('x-userinfo')).thenReturn(BAD_ENCODING);
      const request = instance(mockRequest);
      RequestContext.bind(request);
      expect(() => getEmployeeId(request)).toThrowError(
        messages.NOT_AUTHENTICATED
      );
    });
  });

  describe('getCompanyId', () => {
    it('returns employee id if xuserinfo provided', async () => {
      const mockReq = mock<Request>();
      when(mockReq.header('x-userinfo')).thenReturn(ENCODED);
      const request = instance(mockReq);
      RequestContext.bind(request);
      const companyId = await getCompanyId(request);
      expect(companyId).toEqual(COMPANY_ID);
    });

    it('throws exception if xuserinfo invalid', async () => {
      const mockReq = mock<Request>();
      when(mockReq.header('x-userinfo')).thenReturn(BAD_ENCODING);
      const request = instance(mockReq);
      RequestContext.bind(request);

      await expect(() => getCompanyId(request)).rejects.toThrowError(
        messages.NOT_AUTHENTICATED
      );
    });
  });
});
