import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    max: 20, 
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
    console.log(' Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Database Error', err);
    process.exit(-1);
});

// Query function
export const query = (text, params) => {
    const start = Date.now();
    return pool.query(text, params)
        .then(res => {
            const duration = Date.now() - start;
            console.log(`Query executed`, { text: text.slice(0, 50) + '...', duration, rows: res.rowCount });
            return res;
        })
        .catch(err => {
            console.error('Database query error:', err);
            throw err;
        });
};

export default pool;