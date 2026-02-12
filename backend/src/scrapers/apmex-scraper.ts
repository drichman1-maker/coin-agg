import * as cheerio from 'cheerio';
import { BaseScraper, ScraperResult } from './base-scraper';
import { Coin } from '../types/coin';

export class ApmexScraper extends BaseScraper {
    constructor() {
        super('APMEX', 'https://www.apmex.com');
    }

    async scrape(): Promise<ScraperResult> {
        const coins: Omit<Coin, 'createdAt' | 'updatedAt'>[] = [];
        const errors: string[] = [];

        try {
            this.log('Starting APMEX scrape...');

            // APMEX collectible coins categories
            const categories = [
                '/c/gold-eagle-coins',
                '/c/silver-eagle-coins',
                '/c/certified-coins',
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

            this.log(`APMEX scrape completed. Total coins: ${coins.length}`);
        } catch (error) {
            const errorMsg = `APMEX scrape failed: ${error}`;
            this.log(errorMsg, 'error');
            errors.push(errorMsg);
        }

        return { coins, errors };
    }

    private async scrapeCategory(category: string): Promise<Omit<Coin, 'createdAt' | 'updatedAt'>[]> {
        const coins: Omit<Coin, 'createdAt' | 'updatedAt'>[] = [];

        const response = await this.retryRequest(() =>
            this.client.get(category, {
                params: {
                    p: 1,
                    product_list_limit: 48,
                },
            })
        );

        const $ = cheerio.load(response.data);

        // APMEX uses product grid items
        $('.product-item').each((_, element) => {
            try {
                const $item = $(element);

                const title = $item.find('.product-item-link').text().trim();
                const priceText = $item.find('.price').first().text().trim();
                const price = this.extractPrice(priceText);
                const imageUrl = $item.find('.product-image-photo').attr('src');
                const relativeUrl = $item.find('.product-item-link').attr('href');
                const sourceUrl = relativeUrl ? new URL(relativeUrl, this.baseUrl).href : '';

                if (!title || !price || !sourceUrl) {
                    return; // Skip invalid items
                }

                // Extract year from title if present
                const year = this.extractYear(title);
                const grade = this.extractGrade(title);
                const mint = this.extractMint(title);
                const certification = this.extractCertification(title);

                // Determine coin type from category and title
                let coinType = 'Other';
                if (title.toLowerCase().includes('gold') || category.includes('gold')) {
                    coinType = 'Gold';
                } else if (title.toLowerCase().includes('silver') || category.includes('silver')) {
                    coinType = 'Silver';
                } else if (title.toLowerCase().includes('platinum')) {
                    coinType = 'Platinum';
                }

                const coin: Omit<Coin, 'createdAt' | 'updatedAt'> = {
                    id: this.generateId('apmex', sourceUrl),
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
                    sourceName: 'APMEX',
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
