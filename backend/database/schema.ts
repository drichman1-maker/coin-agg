import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

export async function initDatabase() {
    const client = await pool.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS coins (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                symbol TEXT NOT NULL,
                price DECIMAL NOT NULL,
                market_cap DECIMAL,
                volume_24h DECIMAL,
                change_24h DECIMAL,
                last_updated TIMESTAMP NOT NULL
            );
        `);

        console.log('PostgreSQL database initialized.');
    } finally {
        client.release();
    }

    return pool;
}