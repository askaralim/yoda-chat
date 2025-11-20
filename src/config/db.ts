import mysql from 'mysql2/promise';
import { config } from './env.js';

export const db = mysql.createPool({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
});
