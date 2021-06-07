import runApp from '../../src/runApp';
import cluster from 'cluster';
import {
  mock,
  instance,
  capture,
  when,
  anyNumber,
  anyFunction,
} from 'ts-mockito';
import express from 'express';
import os from 'os';

jest.mock('os', () => ({
  cpus: jest.fn(),
}));

jest.mock('cluster', () => ({ fork: jest.fn() }));

describe('runApp', () => {
  const port: number = 5000;
  const OLD_ENV = process.env;
  let applicationTypeMock: express.Application;
  let app: express.Application;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };

    (os.cpus as jest.Mock).mockReturnValue([{ model: 'thread1' }]);
    applicationTypeMock = mock<express.Application>();
    app = instance(applicationTypeMock);
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  describe('runApp', () => {
    it('will fork current process if isMaster=true', async () => {
      process.env.RUN_AS_CLUSTER = 'true';
      (cluster as any).isMaster = true;

      await runApp(app, { port });
      expect(cluster.fork).toHaveBeenCalledTimes(1);
      expect(os.cpus).toHaveBeenCalled();
    });

    it('will run single thread with port if RUN_AS_CLUSTER=false', async () => {
      process.env.RUN_AS_CLUSTER = 'false';
      (cluster as any).isMaster = true;
      await runApp(app, { port });
      assertAppRanWithSingleThread();
    });

    it('will run single thread with port if isMaster=false', async () => {
      process.env.RUN_AS_CLUSTER = 'false';
      (cluster as any).isMaster = false;
      await runApp(app, { port });
      assertAppRanWithSingleThread();
    });

    it('will run single thread with port after setup', async () => {
      process.env.RUN_AS_CLUSTER = 'false';
      (cluster as any).isMaster = false;

      let wasSet = false;
      const setup = async () => {
        wasSet = true;
      };

      when(applicationTypeMock.listen(anyNumber(), anyFunction())).thenCall(
        (port: number, cb: () => void) => {
          expect(port).toEqual(port);
          cb();
        }
      );
      const options = {
        port,
        setup,
      };
      await runApp(app, options);

      assertAppRanWithSingleThread();
      expect(wasSet).toBeTruthy();
    });

    function assertAppRanWithSingleThread() {
      expect(cluster.fork).not.toHaveBeenCalled();
      expect(os.cpus).not.toHaveBeenCalled();
      const [port, callback] = capture(applicationTypeMock.listen).first();
      expect(port).toEqual(port);
      expect(callback).toEqual(expect.any(Function));
    }
  });
});
