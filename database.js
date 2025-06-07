import pg from 'pg';
import env from 'dotenv';
import { ParameterizedQuery } from 'pg-promise';
const { Client } = require('pg');
const db = new pgClient({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database:process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
})

db.connect()
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Connection error', err.stack));

export const query = (text, params) => db.query(text, params);