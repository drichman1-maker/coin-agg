import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import coinRoutes from './routes/coins';
import { aggregatorService } from './services/aggregator';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

import { initDatabase } from './database/schema';

// Routes
app.use('/api/coins', coinRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Schedule automatic data refresh
const scrapeInterval = parseInt(process.env.SCRAPE_INTERVAL_HOURS || '6');
const cronSchedule = `0 */${scrapeInterval} * * *`; // Every N hours

cron.schedule(cronSchedule, async () => {
    console.log('Running scheduled aggregation...');
    try {
        const result = await aggregatorService.runAggregation();
        console.log('Scheduled aggregation completed:', result);
    } catch (error) {
        console.error('Scheduled aggregation failed:', error);
    }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
    try {
        console.log('Initializing database...');
        await initDatabase();
        console.log('Database initialized successfully.');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Automatic scraping scheduled every ${scrapeInterval} hours`);
        });

        // Run initial aggregation on startup (after a short delay)
        setTimeout(async () => {
            console.log('Running initial aggregation...');
            try {
                const result = await aggregatorService.runAggregation();
                console.log('Initial aggregation completed:', result);
            } catch (error) {
                console.error('Initial aggregation failed:', error);
            }
        }, 5000); // 5 second delay to let server start

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
