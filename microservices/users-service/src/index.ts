import { runApp } from '@alcumus/express-app';
import app from './app';
import connectToMongoose from '@alcumus/mongoose-lib';
import { USER_SERVICE_DB_URL, USER_SERVICE_PORT } from './constants';

runApp(app, {
  port: USER_SERVICE_PORT,
  setup: connectToMongoose(USER_SERVICE_DB_URL),
}).catch((reason) => {
  console.error(`Process ${process.pid} failed due to: ${reason}`);
});
