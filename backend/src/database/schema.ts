import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { Coin } from '../types/coin';

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'coins.db');

let db: Database;

export async function initDatabase() {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable WAL mode for better concurrency
  await db.run('PRAGMA journal_mode = WAL');

  // Create tables
  const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS coins (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_coins_price ON coins(price);
      CREATE INDEX IF NOT EXISTS idx_coins_year ON coins(year);
      CREATE INDEX IF NOT EXISTS idx_coins_source ON coins(source_name);
      CREATE INDEX IF NOT EXISTS idx_coins_type ON coins(coin_type);
      CREATE INDEX IF NOT EXISTS idx_coins_created ON coins(created_at);

      CREATE TABLE IF NOT EXISTS scrape_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_name TEXT NOT NULL,
        status TEXT NOT NULL,
        coins_scraped INTEGER DEFAULT 0,
        error_message TEXT,
        scraped_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;

  await db.exec(createTablesSQL);
  return db;
}

export class CoinDatabase {
  // Insert or update a coin
  static async upsertCoin(coin: Omit<Coin, 'createdAt' | 'updatedAt'>): Promise<void> {
    await db.run(`
      INSERT INTO coins (
        id, title, description, price, currency, year, mint, grade,
        certification, coin_type, image_url, source_url, source_name, availability
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        price = excluded.price,
        currency = excluded.currency,
        year = excluded.year,
        mint = excluded.mint,
        grade = excluded.grade,
        certification = excluded.certification,
        coin_type = excluded.coin_type,
        image_url = excluded.image_url,
        source_url = excluded.source_url,
        availability = excluded.availability,
        updated_at = CURRENT_TIMESTAMP
    `, [
      coin.id, coin.title, coin.description, coin.price, coin.currency, coin.year,
      coin.mint, coin.grade, coin.certification, coin.coinType, coin.imageUrl,
      coin.sourceUrl, coin.sourceName, coin.availability
    ]);
  }

  // Bulk insert coins
  static async bulkUpsertCoins(coins: Omit<Coin, 'createdAt' | 'updatedAt'>[]): Promise<void> {
    // Simple sequential upsert for now, SQLite handles this okay
    // For better performance, we'd use a transaction manually
    await db.run('BEGIN TRANSACTION');
    try {
      for (const coin of coins) {
        await this.upsertCoin(coin);
      }
      await db.run('COMMIT');
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  }

  // Get coin by ID
  static async getCoinById(id: string): Promise<Coin | undefined> {
    const coin = await db.get(`
      SELECT 
        id, title, description, price, currency, year, mint, grade,
        certification, coin_type as coinType, image_url as imageUrl,
        source_url as sourceUrl, source_name as sourceName, availability,
        created_at as createdAt, updated_at as updatedAt
      FROM coins
      WHERE id = ?
    `, id);

    return coin as Coin | undefined;
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

    if (filters.ids && filters.ids.length > 0) {
      const placeholders = filters.ids.map(() => '?').join(',');
      whereClause += ` AND id IN (${placeholders})`;
      params.push(...filters.ids);
    }

    if (filters.search) {
      whereClause += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.minPrice !== undefined) {
      whereClause += ' AND price >= ?';
      params.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      whereClause += ' AND price <= ?';
      params.push(filters.maxPrice);
    }

    if (filters.minYear !== undefined) {
      whereClause += ' AND year >= ?';
      params.push(filters.minYear);
    }

    if (filters.maxYear !== undefined) {
      whereClause += ' AND year <= ?';
      params.push(filters.maxYear);
    }

    if (filters.grade) {
      whereClause += ' AND grade = ?';
      params.push(filters.grade);
    }

    if (filters.certification) {
      whereClause += ' AND certification = ?';
      params.push(filters.certification);
    }

    if (filters.coinType) {
      whereClause += ' AND coin_type = ?';
      params.push(filters.coinType);
    }

    if (filters.source) {
      whereClause += ' AND source_name = ?';
      params.push(filters.source);
    }

    if (filters.availability) {
      whereClause += ' AND availability = ?';
      params.push(filters.availability);
    }

    // Get total count
    const countResult = await db.get(`SELECT COUNT(*) as count FROM coins ${whereClause}`, ...params);
    const count = countResult.count;

    // Get paginated results
    const offset = (page - 1) * limit;
    const coins = await db.all(`
      SELECT 
        id, title, description, price, currency, year, mint, grade,
        certification, coin_type as coinType, image_url as imageUrl,
        source_url as sourceUrl, source_name as sourceName, availability,
        created_at as createdAt, updated_at as updatedAt
      FROM coins
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, ...params, limit, offset);

    return { coins: coins as Coin[], total: count };
  }

  // Get source statistics
  static async getSourceStats(): Promise<Array<{ sourceName: string; count: number; lastUpdated: string }>> {
    const stats = await db.all(`
      SELECT 
        source_name as sourceName,
        COUNT(*) as count,
        MAX(updated_at) as lastUpdated
      FROM coins
      GROUP BY source_name
    `);

    return stats as Array<{ sourceName: string; count: number; lastUpdated: string }>;
  }

  // Log scrape activity
  static async logScrape(sourceName: string, status: 'success' | 'error', coinsScraped: number, errorMessage?: string): Promise<void> {
    await db.run(`
      INSERT INTO scrape_log (source_name, status, coins_scraped, error_message)
      VALUES (?, ?, ?, ?)
    `, sourceName, status, coinsScraped, errorMessage || null);
  }

  // Delete old coins (older than specified days)
  static async deleteOldCoins(days: number): Promise<number> {
    const result = await db.run(`
      DELETE FROM coins
      WHERE updated_at < datetime('now', '-' || ? || ' days')
    `, days);

    return result.changes || 0;
  }
}
