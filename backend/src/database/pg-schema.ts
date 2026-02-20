import { Pool } from 'pg';
import { Coin } from '../types/coin';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Max number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Create tables
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS coins (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        year INTEGER,
        mint TEXT,
        grade TEXT,
        certification TEXT,
        coin_type TEXT NOT NULL,
        image_url TEXT,
        source_url TEXT NOT NULL,
        source_name TEXT NOT NULL,
        availability TEXT DEFAULT 'unknown',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_coins_price ON coins(price);
      CREATE INDEX IF NOT EXISTS idx_coins_year ON coins(year);
      CREATE INDEX IF NOT EXISTS idx_coins_source ON coins(source_name);
      CREATE INDEX IF NOT EXISTS idx_coins_type ON coins(coin_type);
      CREATE INDEX IF NOT EXISTS idx_coins_created ON coins(created_at);

      CREATE TABLE IF NOT EXISTS scrape_log (
        id SERIAL PRIMARY KEY,
        source_name TEXT NOT NULL,
        status TEXT NOT NULL,
        coins_scraped INTEGER DEFAULT 0,
        error_message TEXT,
        scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(createTablesSQL);
  } finally {
    client.release();
  }
  return pool;
}

export class CoinDatabase {
  // Insert or update a coin
  static async upsertCoin(coin: Omit<Coin, 'createdAt' | 'updatedAt'>): Promise<void> {
    const query = `
      INSERT INTO coins (
        id, title, description, price, currency, year, mint, grade,
        certification, coin_type, image_url, source_url, source_name, availability
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT(id) DO UPDATE SET
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
        availability = EXCLUDED.availability,
        updated_at = CURRENT_TIMESTAMP
    `;

    const values = [
      coin.id, coin.title, coin.description, coin.price, coin.currency, coin.year,
      coin.mint, coin.grade, coin.certification, coin.coinType, coin.imageUrl,
      coin.sourceUrl, coin.sourceName, coin.availability
    ];

    await pool.query(query, values);
  }

  // Bulk insert coins - Now with proper batching
  static async bulkUpsertCoins(coins: Omit<Coin, 'createdAt' | 'updatedAt'>[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Process in batches of 100
      const batchSize = 100;
      for (let i = 0; i < coins.length; i += batchSize) {
        const batch = coins.slice(i, i + batchSize);
        const values = batch.map(coin => [
          coin.id, coin.title, coin.description, coin.price, coin.currency, coin.year,
          coin.mint, coin.grade, coin.certification, coin.coinType, coin.imageUrl,
          coin.sourceUrl, coin.sourceName, coin.availability
        ]).flat();

        const placeholders = batch.map((_, idx) => {
          const base = idx * 14;
          return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14})`;
        }).join(',');

        const query = `
          INSERT INTO coins (
            id, title, description, price, currency, year, mint, grade,
            certification, coin_type, image_url, source_url, source_name, availability
          ) VALUES ${placeholders}
          ON CONFLICT(id) DO UPDATE SET
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
            availability = EXCLUDED.availability,
            updated_at = CURRENT_TIMESTAMP
        `;

        await client.query(query, values);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get coin by ID
  static async getCoinById(id: string): Promise<Coin | undefined> {
    const result = await pool.query(`
      SELECT 
        id, title, description, price, currency, year, mint, grade,
        certification, coin_type as "coinType", image_url as "imageUrl",
        source_url as "sourceUrl", source_name as "sourceName", availability,
        created_at as "createdAt", updated_at as "updatedAt"
      FROM coins
      WHERE id = $1
    `, [id]);

    return result.rows[0] as Coin | undefined;
  }

  // Search and filter coins with pagination
  static async searchCoins(
    filters: {
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      minYear?: number;
      maxYear?: number;
      grade?: string;
      certification?: string;
      coinType?: string;
      source?: string;
      availability?: string;
      ids?: string[];
    },
    page: number = 1,
    limit: number = 24
  ): Promise<{ coins: Coin[]; total: number }> {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (filters.ids && filters.ids.length > 0) {
      whereClause += ` AND id = ANY($${++paramCount})`;
      params.push(filters.ids);
    }

    if (filters.search) {
      whereClause += ` AND (title ILIKE $${++paramCount} OR description ILIKE $${++paramCount})`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.minPrice !== undefined) {
      whereClause += ` AND price >= $${++paramCount}`;
      params.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      whereClause += ` AND price <= $${++paramCount}`;
      params.push(filters.maxPrice);
    }

    if (filters.minYear !== undefined) {
      whereClause += ` AND year >= $${++paramCount}`;
      params.push(filters.minYear);
    }

    if (filters.maxYear !== undefined) {
      whereClause += ` AND year <= $${++paramCount}`;
      params.push(filters.maxYear);
    }

    if (filters.grade) {
      whereClause += ` AND grade = $${++paramCount}`;
      params.push(filters.grade);
    }

    if (filters.certification) {
      whereClause += ` AND certification = $${++paramCount}`;
      params.push(filters.certification);
    }

    if (filters.coinType) {
      whereClause += ` AND coin_type = $${++paramCount}`;
      params.push(filters.coinType);
    }

    if (filters.source) {
      whereClause += ` AND source_name = $${++paramCount}`;
      params.push(filters.source);
    }

    if (filters.availability) {
      whereClause += ` AND availability = $${++paramCount}`;
      params.push(filters.availability);
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM coins ${whereClause}`,
      params
    );
    const count = parseInt(countResult.rows[0].count);

    // Get paginated results
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const coins = await pool.query(`
      SELECT 
        id, title, description, price, currency, year, mint, grade,
        certification, coin_type as "coinType", image_url as "imageUrl",
        source_url as "sourceUrl", source_name as "sourceName", availability,
        created_at as "createdAt", updated_at as "updatedAt"
      FROM coins
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `, params);

    return { coins: coins.rows as Coin[], total: count };
  }

  // Get source statistics
  static async getSourceStats(): Promise<Array<{ sourceName: string; count: number; lastUpdated: string }>> {
    const result = await pool.query(`
      SELECT 
        source_name as "sourceName",
        COUNT(*) as count,
        MAX(updated_at) as "lastUpdated"
      FROM coins
      GROUP BY source_name
    `);

    return result.rows;
  }

  // Log scrape activity
  static async logScrape(sourceName: string, status: 'success' | 'error', coinsScraped: number, errorMessage?: string): Promise<void> {
    await pool.query(`
      INSERT INTO scrape_log (source_name, status, coins_scraped, error_message)
      VALUES ($1, $2, $3, $4)
    `, [sourceName, status, coinsScraped, errorMessage || null]);
  }

  // Delete old coins (older than specified days)
  static async deleteOldCoins(days: number): Promise<number> {
    const result = await pool.query(`
      DELETE FROM coins
      WHERE updated_at < NOW() - INTERVAL '${days} days'
      RETURNING id
    `);

    return result.rowCount;
  }
}