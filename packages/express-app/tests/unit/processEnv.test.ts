import ProcessEnvInstance, {
  ProcessEnvWrapper,
  ProcessEnvObject,
} from '../../src/processEnvWrapper';

class TestableProcessEnv extends ProcessEnvWrapper {
  constructor(processEnv: ProcessEnvObject) {
    super(processEnv);
  }
}

const processEnvObject: ProcessEnvObject = Object.freeze({
  truthy: 'true',
  on: 'on',
  falsy: 'false',
  off: 'off',
  stringy: 'http://localhost:2000',
});

describe('processEnv', () => {
  describe('getValue', () => {
    it('returns string from constructor argument property', () => {
      const subject = new TestableProcessEnv(processEnvObject);
      expect(subject.getValue('truthy')).toEqual(processEnvObject.truthy);
      expect(subject.getValue('on')).toEqual(processEnvObject.on);
      expect(subject.getValue('off')).toEqual(processEnvObject.off);
      expect(subject.getValue('falsy')).toEqual(processEnvObject.falsy);
      expect(subject.getValue('stringy')).toEqual(processEnvObject.stringy);
      expect(subject.getValue('notThere')).toEqual(undefined);
    });
  });

  describe('getValueOrDefault', () => {
    it('returns value or truthy default', () => {
      const defaultValue = 'something else';
      const subject = new TestableProcessEnv(processEnvObject);
      expect(subject.getValueOrDefault('truthy', defaultValue)).toEqual(
        processEnvObject.truthy
      );
      expect(subject.getValueOrDefault('notThere', defaultValue)).toEqual(
        defaultValue
      );
    });
  });

  describe('getValueOrThrow', () => {
    it('returns value if present', () => {
      const subject = new TestableProcessEnv(processEnvObject);
      expect(subject.getValueOrThrow('truthy')).toEqual(
        processEnvObject.truthy
      );
    });
    it('throws error if not present', () => {
      const subject = new TestableProcessEnv(processEnvObject);
      expect(() => subject.getValueOrThrow('notThere')).toThrow(
        `process.env.notThere is not defined but is required for service to be healthy`
      );
    });
  });

  describe('isEnabled', () => {
    it('returns true if value is not false, off, or undefined', () => {
      const subject = new TestableProcessEnv(processEnvObject);
      expect(subject.isEnabled('truthy')).toEqual(true);
      expect(subject.isEnabled('on')).toEqual(true);
      expect(subject.isEnabled('stringy')).toEqual(true);
    });
    it('returns false if value is false, off, or undefined ', () => {
      const subject = new TestableProcessEnv(processEnvObject);
      expect(subject.isEnabled('off')).toEqual(false);
      expect(subject.isEnabled('falsy')).toEqual(false);
      expect(subject.isEnabled('notThere')).toEqual(false);
    });
  });

  describe('getInstance', () => {
    it('is same object, every time', () => {
      expect(ProcessEnvInstance).toBe(ProcessEnvWrapper.getInstance());
      expect(ProcessEnvWrapper.getInstance()).toBe(
        ProcessEnvWrapper.getInstance()
      );
    });
  });
});
