import app from './app';
import { runApp } from '@alcumus/express-app';
import connectToMongoose from '@alcumus/mongoose-lib';
import { HIGH_FIVE_SERVICE_DB_URL, HIGH_FIVE_SERVICE_PORT } from './constants';

runApp(app, {
  port: HIGH_FIVE_SERVICE_PORT,
  setup: connectToMongoose(HIGH_FIVE_SERVICE_DB_URL),
}).catch((error) => {
  console.error(`Process ${process.pid} failed due to ${error}`);
});

export { app };
