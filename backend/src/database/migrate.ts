import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Pool } from 'pg';
import path from 'path';

async function migrate() {
  // Connect to SQLite
  const dbPath = path.join(__dirname, '../../data/coins.db');
  const sqlite = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Connect to PostgreSQL
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  const client = await pool.connect();

  try {
    console.log('Starting migration...');
    
    // Get total count
    const countResult = await sqlite.get('SELECT COUNT(*) as count FROM coins');
    const totalCoins = countResult.count;
    console.log(`Total coins to migrate: ${totalCoins}`);

    // Migrate in batches
    const batchSize = 100;
    let processed = 0;

    while (processed < totalCoins) {
      const coins = await sqlite.all(`
        SELECT * FROM coins 
        LIMIT ${batchSize} 
        OFFSET ${processed}
      `);

      if (coins.length === 0) break;

      const values = coins.map(coin => [
        coin.id,
        coin.title,
        coin.description,
        coin.price,
        coin.currency,
        coin.year,
        coin.mint,
        coin.grade,
        coin.certification,
        coin.coin_type,
        coin.image_url,
        coin.source_url,
        coin.source_name,
        coin.availability,
        coin.created_at,
        coin.updated_at
      ]).flat();

      const placeholders = coins.map((_, idx) => {
        const base = idx * 16;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14}, $${base + 15}, $${base + 16})`;
      }).join(',');

      const query = `
        INSERT INTO coins (
          id, title, description, price, currency, year, mint, grade,
          certification, coin_type, image_url, source_url, source_name, 
          availability, created_at, updated_at
        ) VALUES ${placeholders}
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          currency = EXCLUDED.currency,
          year = EXCLUDED.year,
          mint = EXCLUDED.mint,
          grade = EXCLUDED.grade,
          certification = EXCLUDED.certification,
          coin_type = EXCLUDED.coin_type,
          image_url = EXCLUDED.image_url,
          source_url = EXCLUDED.source_url,
          source_name = EXCLUDED.source_name,
          availability = EXCLUDED.availability,
          updated_at = EXCLUDED.updated_at
      `;

      await client.query(query, values);
      processed += coins.length;
      console.log(`Migrated ${processed}/${totalCoins} coins`);
    }

    // Migrate scrape_log
    console.log('Migrating scrape_log...');
    const logs = await sqlite.all('SELECT * FROM scrape_log');
    
    if (logs.length > 0) {
      const logValues = logs.map(log => [
        log.source_name,
        log.status,
        log.coins_scraped,
        log.error_message,
        log.scraped_at
      ]).flat();

      const logPlaceholders = logs.map((_, idx) => {
        const base = idx * 5;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
      }).join(',');

      await client.query(`
        INSERT INTO scrape_log (
          source_name, status, coins_scraped, error_message, scraped_at
        ) VALUES ${logPlaceholders}
      `, logValues);
    }

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.release();
    await sqlite.close();
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate().catch(console.error);
}

export default migrate;