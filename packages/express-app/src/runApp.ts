import express from 'express';
import cluster from 'cluster';
import os from 'os';

export interface AppStartupOptions {
  port: number;
  setup?: () => Promise<void>;
  callback?: () => void;
}

export default async function runApp(
  app: express.Application,
  options: AppStartupOptions
) {
  const { port, setup = undefined, callback = undefined } = options;

  const runAsCluster =
    Boolean(process.env.RUN_AS_CLUSTER) &&
    process.env.RUN_AS_CLUSTER !== 'false';

  if (runAsCluster && cluster.isMaster) {
    console.info(`Main worker process id: ${process.pid}`);
    const cpus = os.cpus();
    console.info(
      `Forking ${cpus.length} child processes on CPU Model ${cpus[0].model}`
    );
    for (let i = 0; i < cpus.length; i++) {
      cluster.fork();
    }
  } else if (typeof setup === 'function') {
    setup().then(() => {
      app.listen(port, notifyListeners(port, callback));
    });
  } else {
    app.listen(port, notifyListeners(port, callback));
  }
}

function notifyListeners(
  port: number,
  callback: (() => void) | undefined
): () => void {
  return () => {
    console.info(
      `Child process id ${process.pid} running, listening on port ${port}`
    );

    if (typeof callback === 'function') {
      callback();
    }
  };
}
