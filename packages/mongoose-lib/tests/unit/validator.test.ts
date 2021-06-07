import {
  optionalAlcumusPlatformIdValidator,
  optionalHestiaUserIdValidator,
} from '../../src';

describe('mongoose-lib/validators', () => {
  describe('optionalHestiaUserIdValidator', () => {
    it('accepts valid hestia user id', () => {
      const validId1 = '123456:hestia/users';
      const validId2 = 'd046ad99-2f03-40b3-814b-bf23b228b488:hestia/users';
      expect(optionalHestiaUserIdValidator(validId1)).toBeTruthy();
      expect(optionalHestiaUserIdValidator(validId2)).toBeTruthy();
    });
    it('rejects any other id', () => {
      const baseId = '123456';
      const baseId2 = 'd046ad99-2f03-40b3-814b-bf23b228b488';
      expect(optionalHestiaUserIdValidator(baseId)).toBeFalsy();
      expect(optionalHestiaUserIdValidator(baseId2)).toBeFalsy();
      expect(optionalHestiaUserIdValidator(`${baseId}:db/wf_user`)).toBeFalsy();
      expect(
        optionalHestiaUserIdValidator(`${baseId2}:db/wf_user`)
      ).toBeFalsy();
    });
    it('accepts null or empty string', () => {
      expect(optionalHestiaUserIdValidator('')).toBeTruthy();
      expect(optionalHestiaUserIdValidator(null)).toBeTruthy();
    });
  });

  describe('optionalAlcumusPlatformIdValidator', () => {
    it('accepts valid hestia user id', () => {
      const validId1 = '123456:hestia/user';
      const validId2 = 'd046ad99-2f03-40b3-814b-bf23b228b488:hestia/user';
      expect(optionalAlcumusPlatformIdValidator(validId1)).toBeTruthy();
      expect(optionalAlcumusPlatformIdValidator(validId2)).toBeTruthy();
    });
    it('accepts any other full id', () => {
      const baseId = '123456';
      const baseId2 = 'd046ad99-2f03-40b3-814b-bf23b228b488';
      expect(optionalAlcumusPlatformIdValidator(baseId)).toBeFalsy();
      expect(optionalAlcumusPlatformIdValidator(baseId2)).toBeFalsy();
      expect(
        optionalAlcumusPlatformIdValidator(`${baseId}:db/wf_user`)
      ).toBeTruthy();
      expect(
        optionalAlcumusPlatformIdValidator(`${baseId2}:otherDb/more_users`)
      ).toBeTruthy();
    });
    it('accepts null or empty string', () => {
      expect(optionalAlcumusPlatformIdValidator('')).toBeTruthy();
      expect(optionalAlcumusPlatformIdValidator(null)).toBeTruthy();
    });
  });
});
