import * as cheerio from 'cheerio';
import { BaseScraper, ScraperResult } from './base-scraper';
import { Coin } from '../types/coin';

export class JMBullionScraper extends BaseScraper {
    constructor() {
        super('JM Bullion', 'https://www.jmbullion.com');
    }

    async scrape(): Promise<ScraperResult> {
        const coins: Omit<Coin, 'createdAt' | 'updatedAt'>[] = [];
        const errors: string[] = [];

        try {
            this.log('Starting JM Bullion scrape...');

            const categories = [
                '/gold/gold-eagle-coins/',
                '/silver/american-silver-eagle-coins/',
                '/certified-coins/',
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

            this.log(`JM Bullion scrape completed. Total coins: ${coins.length}`);
        } catch (error) {
            const errorMsg = `JM Bullion scrape failed: ${error}`;
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

        // JM Bullion uses product cards
        $('.product-item, .product').each((_, element) => {
            try {
                const $item = $(element);

                const title = $item.find('.product-name, .product-item-name').text().trim();
                const priceText = $item.find('.price, .product-price').first().text().trim();
                const price = this.extractPrice(priceText);
                const imageUrl = $item.find('img.product-image-photo, img').first().attr('src') ||
                    $item.find('img.product-image-photo, img').first().attr('data-src');
                const relativeUrl = $item.find('a.product-item-link, a.product-link').first().attr('href');
                const sourceUrl = relativeUrl ? new URL(relativeUrl, this.baseUrl).href : '';

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
                } else if (title.toLowerCase().includes('platinum')) {
                    coinType = 'Platinum';
                } else if (title.toLowerCase().includes('copper')) {
                    coinType = 'Copper';
                }

                const coin: Omit<Coin, 'createdAt' | 'updatedAt'> = {
                    id: this.generateId('jmbullion', sourceUrl),
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
                    sourceName: 'JM Bullion',
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
