import pg from 'pg';
import env from 'dotenv';
env.config();

const database = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'shoplah',
    password: String(1122334455),
    port: 5432,
})

database.connect();

export const query = (text, params) => database.query(text, params);