import * as cheerio from 'cheerio';
import { BaseScraper, ScraperResult } from './base-scraper';
import { Coin } from '../types/coin';

export class MonumentMetalsScraper extends BaseScraper {
    constructor() {
        super('Monument Metals', 'https://monumentmetals.com');
    }

    async scrape(): Promise<ScraperResult> {
        const coins: Omit<Coin, 'createdAt' | 'updatedAt'>[] = [];
        const errors: string[] = [];

        try {
            this.log('Starting Monument Metals scrape...');

            const categories = [
                '/gold/american-gold-eagles.html',
                '/silver/american-silver-eagles.html',
                '/certified-coins.html',
            ];

            for (const category of categories) {
                try {
                    await this.delay();
                    const categoryCoins = await this.scrapeCategory(category);
                    coins.push(...categoryCoins);
                    this.log(`Scraped ${categoryCoins.length} coins from ${category}`);
                } catch (error) {
                    const errorMsg = `Error scraping category ${category}: ${error}`;
                    this.log(errorMsg, 'error');
                    errors.push(errorMsg);
                }
            }

            this.log(`Monument Metals scrape completed. Total coins: ${coins.length}`);
        } catch (error) {
            const errorMsg = `Monument Metals scrape failed: ${error}`;
            this.log(errorMsg, 'error');
            errors.push(errorMsg);
        }

        return { coins, errors };
    }

    private async scrapeCategory(category: string): Promise<Omit<Coin, 'createdAt' | 'updatedAt'>[]> {
        const coins: Omit<Coin, 'createdAt' | 'updatedAt'>[] = [];

        const response = await this.retryRequest(() =>
            this.client.get(category)
        );

        const $ = cheerio.load(response.data);

        // Monument Metals uses product items in a grid
        $('.product-item').each((_, element) => {
            try {
                const $item = $(element);

                const title = $item.find('.product-item-name a').text().trim();
                const priceText = $item.find('.price').first().text().trim();
                const price = this.extractPrice(priceText);
                const imageUrl = $item.find('.product-image-photo').attr('src');
                const sourceUrl = $item.find('.product-item-name a').attr('href');

                if (!title || !price || !sourceUrl) {
                    return; // Skip invalid items
                }

                const year = this.extractYear(title);
                const grade = this.extractGrade(title);
                const mint = this.extractMint(title);
                const certification = this.extractCertification(title);

                // Determine coin type
                let coinType = 'Other';
                if (title.toLowerCase().includes('gold') || category.includes('gold')) {
                    coinType = 'Gold';
                } else if (title.toLowerCase().includes('silver') || category.includes('silver')) {
                    coinType = 'Silver';
                }

                const coin: Omit<Coin, 'createdAt' | 'updatedAt'> = {
                    id: this.generateId('monument', sourceUrl),
                    title,
                    description: title,
                    price,
                    currency: 'USD',
                    year,
                    mint,
                    grade,
                    certification,
                    coinType,
                    imageUrl: imageUrl || undefined,
                    sourceUrl,
                    sourceName: 'Monument Metals',
                    availability: 'in_stock',
                };

                coins.push(coin);
            } catch (error) {
                this.log(`Error parsing item: ${error}`, 'warn');
            }
        });

        return coins;
    }
}
