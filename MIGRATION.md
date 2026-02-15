# PostgreSQL Migration Guide

## Why Migrate?
Moving from SQLite to PostgreSQL for:
- Better scalability
- Concurrent connections
- Advanced indexing
- Better performance with large datasets

## Prerequisites
1. PostgreSQL database URL (from Render or other host)
2. Current SQLite data (in `backend/data/coins.db`)

## Migration Steps

### 1. Install Dependencies
```bash
cd backend
npm install pg pg-pool
```

### 2. Set Environment Variables
```bash
# .env
DATABASE_URL=postgres://username:password@host:5432/dbname
```

### 3. Run Migration
```bash
# This will:
# 1. Copy all data from SQLite to PostgreSQL
# 2. Preserve timestamps and relationships
# 3. Maintain indexes
npm run migrate
```

### 4. Switch to PostgreSQL Schema
```bash
npm run switch-to-pg
```

### 5. Verify Migration
```bash
# Start the server with new PostgreSQL backend
npm run dev

# Check health endpoint
curl http://localhost:3001/api/health

# Verify data access
curl http://localhost:3001/api/coins?limit=1
```

## Rollback Plan
If issues occur:
1. Keep SQLite backup (`coins.db`)
2. Switch back to SQLite schema:
```bash
mv src/database/schema.ts src/database/schema.pg.ts
mv src/database/schema.sqlite.ts src/database/schema.ts
```

## Monitoring
After migration:
- Monitor PostgreSQL connection pool
- Watch for query performance
- Check error rates
- Verify scraper operations

## Next Steps
1. Monitor PostgreSQL metrics
2. Tune pool settings if needed
3. Optimize indexes based on usage
4. Set up automated backups

Questions? Issues? Contact the team.