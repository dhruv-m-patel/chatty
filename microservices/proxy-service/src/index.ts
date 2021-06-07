import { runApp } from '@alcumus/express-app';
import app from './app';

runApp(app, {
  port: 8015,
}).catch((reason: Error) => {
  console.error(`Process ${process.pid} failed due to: ${reason}`);
});
