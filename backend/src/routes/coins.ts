import { Router, Request, Response } from 'express';
import { CoinDatabase } from '../database/schema';
import { aggregatorService } from '../services/aggregator';
import { CsvService } from '../services/export';
import { CoinFilter } from '../types/coin';

const router = Router();

// GET /api/coins - List coins with filters and pagination
router.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 24;

        const filters: CoinFilter = {
            search: req.query.search as string,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
            minYear: req.query.minYear ? parseInt(req.query.minYear as string) : undefined,
            maxYear: req.query.maxYear ? parseInt(req.query.maxYear as string) : undefined,
            grade: req.query.grade as string,
            certification: req.query.certification as string,
            coinType: req.query.coinType as string,
            source: req.query.source as string,
            availability: req.query.availability as string,
            ids: req.query.ids ? (req.query.ids as string).split(',') : undefined,
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => {
            if (filters[key as keyof CoinFilter] === undefined) {
                delete filters[key as keyof CoinFilter];
            }
        });

        const { coins, total } = await CoinDatabase.searchCoins(filters, page, limit);

        res.json({
            data: coins,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching coins:', error);
        res.status(500).json({ error: 'Failed to fetch coins' });
    }
});

// GET /api/coins/export - Export coins to CSV
router.get('/export', async (req: Request, res: Response) => {
    try {
        const filters: CoinFilter = {
            search: req.query.search as string,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
            minYear: req.query.minYear ? parseInt(req.query.minYear as string) : undefined,
            maxYear: req.query.maxYear ? parseInt(req.query.maxYear as string) : undefined,
            grade: req.query.grade as string,
            certification: req.query.certification as string,
            coinType: req.query.coinType as string,
            source: req.query.source as string,
            availability: req.query.availability as string,
            ids: req.query.ids ? (req.query.ids as string).split(',') : undefined,
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => {
            if (filters[key as keyof CoinFilter] === undefined) {
                delete filters[key as keyof CoinFilter];
            }
        });

        // Fetch all matching coins (limit to reasonable max for export, e.g. 1000 or unlimited)
        // Using a large limit for export
        const { coins } = await CoinDatabase.searchCoins(filters, 1, 1000);

        const csv = CsvService.convertToCsv(coins);

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename="coins_export_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting coins:', error);
        res.status(500).json({ error: 'Failed to export coins' });
    }
});

// GET /api/coins/:id - Get single coin
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const coin = await CoinDatabase.getCoinById(req.params.id);

        if (!coin) {
            return res.status(404).json({ error: 'Coin not found' });
        }

        res.json(coin);
    } catch (error) {
        console.error('Error fetching coin:', error);
        res.status(500).json({ error: 'Failed to fetch coin' });
    }
});

// GET /api/coins/:id/similar - Get similar coins from different sources
router.get('/:id/similar', async (req: Request, res: Response) => {
    try {
        const coin = await CoinDatabase.getCoinById(req.params.id);

        if (!coin) {
            return res.status(404).json({ error: 'Coin not found' });
        }

        // Search for similar coins based on title, year, and type
        const filters: CoinFilter = {
            coinType: coin.coinType,
            minYear: coin.year ? coin.year - 1 : undefined,
            maxYear: coin.year ? coin.year + 1 : undefined,
        };

        const { coins } = await CoinDatabase.searchCoins(filters, 1, 20);

        // Filter to similar coins (matching title keywords) and exclude the current coin
        const titleKeywords = coin.title.toLowerCase().split(' ').filter(w => w.length > 3);
        const similarCoins = coins.filter(c => {
            if (c.id === coin.id) return false;
            const cTitle = c.title.toLowerCase();
            return titleKeywords.some(keyword => cTitle.includes(keyword));
        });

        res.json(similarCoins);
    } catch (error) {
        console.error('Error fetching similar coins:', error);
        res.status(500).json({ error: 'Failed to fetch similar coins' });
    }
});

// GET /api/coins/sources/stats - Get source statistics
router.get('/sources/stats', async (req: Request, res: Response) => {
    try {
        const stats = await aggregatorService.getSourceStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching source stats:', error);
        res.status(500).json({ error: 'Failed to fetch source stats' });
    }
});

// POST /api/coins/refresh - Trigger manual refresh
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        // Run aggregation in background
        aggregatorService.runAggregation().then(result => {
            console.log('Manual refresh completed:', result);
        });

        res.json({
            message: 'Refresh started',
            status: 'running'
        });
    } catch (error) {
        console.error('Error starting refresh:', error);
        res.status(500).json({ error: 'Failed to start refresh' });
    }
});

export default router;
