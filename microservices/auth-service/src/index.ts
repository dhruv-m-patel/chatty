import { runApp } from '@alcumus/express-app';
import app from './app';

const port = Number(process.env.AUTH_SERVICE_PORT) || 8010;

runApp(app, { port }).catch((reason) => {
  console.error(`Process ${process.pid} failed due to: ${reason}`);
});
