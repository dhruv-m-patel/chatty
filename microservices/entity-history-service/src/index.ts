import app from './app';
import { ProcessEnv, runApp } from '@alcumus/express-app';
import mysql from 'mysql2';

let pool;
function connectToMySql(): () => Promise<void> {
  return async () => {
    pool = await mysql.createPool({
      host: ProcessEnv.getValueOrDefault('MYSQL_DATBASE_HOST', 'localhost'),
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
    ProcessEnv.getValueOrDefault('ENTITY_HISTORY_SERVICE_PORT', '8040')
  ),
  setup: connectToMySql(),
}).catch((error) => {
  console.error(`Process ${process.pid} failed due to ${error}`);
});

export { app, pool };
