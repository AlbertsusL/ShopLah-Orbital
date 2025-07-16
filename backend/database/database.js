import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Check if to use DATABASE_URL or normal var
const useConnectionString = process.env.DATABASE_URL && process.env.NODE_ENV === 'production';

const connectionConfig = useConnectionString 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  : {
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    };

const pool = new Pool({
    ...connectionConfig,
    max: 20, 
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
    if (useConnectionString) {
        console.log('🔗 Using DATABASE_URL connection');
    } else {
        console.log('🔗 Using individual database variables');
    }
});

pool.on('error', (err) => {
    console.error('❌ Database Error', err);
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