import app from './app';
import { ProcessEnv, runApp } from '@alcumus/express-app';
import mysql from 'mysql2';

let pool;
function connectToMySql(): () => Promise<void> {
  return async () => {
    pool = await mysql.createPool({
      host: ProcessEnv.getValue('MYSQL_DATBASE_HOST'),
      port: Number(ProcessEnv.getValueOrDefault('MYSQL_DATABASE_PORT', '3307')),
      user: ProcessEnv.getValue('MYSQL_DATABASE_USER'),
      password: ProcessEnv.getValue('MYSQL_DATABASE_PASSWORD'),
      connectionLimit: 50,
      queueLimit: 0,
      multipleStatements: true,
    });
    console.log('mySQL connected');
  };
}

runApp(app, {
  port: Number(
    ProcessEnv.getValueOrDefault('SAFETY_INTELLIGENCE_SERVICE_PORT', '8014')
  ),
  setup: connectToMySql(),
}).catch((error) => {
  console.error(`Process ${process.pid} failed due to ${error}`);
});

export { app, pool };
