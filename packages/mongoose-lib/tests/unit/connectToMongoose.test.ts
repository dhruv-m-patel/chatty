import connectToMongoose from '../../src';
import process from 'process';

jest.mock('process', () => ({
  exit: jest.fn(),
}));

describe('unit test: connectToMongoose', () => {
  let errorSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    logSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  it('should report and exit if connection string is invalid', async () => {
    const error = 'Invalid connection string';
    await connectToMongoose('badUrl')();
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalledWith(
      'mongoose-lib error: ',
      expect.objectContaining({
        message: error,
      })
    );
  });

  it('should report and exit if connection string is unreachable', async () => {
    const error = 'Invalid connection string';
    await connectToMongoose('http://fakeMongoDb.local:27017/fakeDb')();
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalledWith(
      'mongoose-lib error: ',
      expect.objectContaining({
        message: error,
      })
    );
  });
});
