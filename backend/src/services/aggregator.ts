import { CoinDatabase } from '../database/schema';
import { ApmexScraper } from '../scrapers/apmex-scraper';
import { JMBullionScraper } from '../scrapers/jmbullion-scraper';
import { MonumentMetalsScraper } from '../scrapers/monument-metals-scraper';
import { BaseScraper } from '../scrapers/base-scraper';
import PQueue from 'p-queue';

export class AggregatorService {
    private scrapers: BaseScraper[];
    private queue: PQueue;
    private isRunning: boolean = false;

    constructor() {
        // Initialize scrapers
        this.scrapers = [
            new ApmexScraper(),
            new JMBullionScraper(),
            new MonumentMetalsScraper(),
        ];

        // Create queue with concurrency limit
        this.queue = new PQueue({ concurrency: 1 }); // Run scrapers sequentially to be respectful
    }

    async runAggregation(): Promise<{
        success: boolean;
        totalCoins: number;
        errors: string[];
    }> {
        if (this.isRunning) {
            console.log('Aggregation already running, skipping...');
            return { success: false, totalCoins: 0, errors: ['Aggregation already in progress'] };
        }

        this.isRunning = true;
        console.log('Starting coin aggregation...');

        let totalCoins = 0;
        const allErrors: string[] = [];

        try {
            for (const scraper of this.scrapers) {
                await this.queue.add(async () => {
                    try {
                        const result = await scraper.scrape();

                        if (result.coins.length > 0) {
                            await CoinDatabase.bulkUpsertCoins(result.coins);
                            totalCoins += result.coins.length;
                            await CoinDatabase.logScrape(
                                (scraper as any).name,
                                'success',
                                result.coins.length
                            );
                        }

                        if (result.errors.length > 0) {
                            allErrors.push(...result.errors);
                        }
                    } catch (error) {
                        const errorMsg = `Scraper ${(scraper as any).name} failed: ${error}`;
                        console.error(errorMsg);
                        allErrors.push(errorMsg);
                        await CoinDatabase.logScrape(
                            (scraper as any).name,
                            'error',
                            0,
                            errorMsg
                        );
                    }
                });
            }

            console.log(`Aggregation completed. Total coins: ${totalCoins}, Errors: ${allErrors.length}`);

            return {
                success: allErrors.length === 0,
                totalCoins,
                errors: allErrors,
            };
        } finally {
            this.isRunning = false;
        }
    }

    async cleanupOldCoins(days: number = 30): Promise<number> {
        console.log(`Cleaning up coins older than ${days} days...`);
        const deleted = await CoinDatabase.deleteOldCoins(days);
        console.log(`Deleted ${deleted} old coins`);
        return deleted;
    }

    async getSourceStats() {
        return await CoinDatabase.getSourceStats();
    }
}

// Singleton instance
export const aggregatorService = new AggregatorService();
