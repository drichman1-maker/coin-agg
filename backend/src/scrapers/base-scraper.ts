import axios, { AxiosInstance } from 'axios';
import { Coin } from '../types/coin';

export interface ScraperResult {
    coins: Omit<Coin, 'createdAt' | 'updatedAt'>[];
    errors: string[];
}

export abstract class BaseScraper {
    protected name: string;
    protected baseUrl: string;
    protected client: AxiosInstance;
    protected requestDelay: number;
    protected maxRetries: number;

    constructor(name: string, baseUrl: string) {
        this.name = name;
        this.baseUrl = baseUrl;
        this.requestDelay = parseInt(process.env.REQUEST_DELAY_MS || '2000');
        this.maxRetries = parseInt(process.env.MAX_RETRIES || '3');

        this.client = axios.create({
            baseURL: baseUrl,
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0',
            },
        });

        // Update headers to include Referer dynamically
        this.client.interceptors.request.use((config) => {
            if (config.url && !config.headers['Referer']) {
                config.headers['Referer'] = this.baseUrl;
            }
            return config;
        });
    }

    // Abstract method that each scraper must implement
    abstract scrape(): Promise<ScraperResult>;

    // Helper method to delay between requests
    protected async delay(ms?: number): Promise<void> {
        const delayTime = ms || this.requestDelay;
        return new Promise(resolve => setTimeout(resolve, delayTime));
    }

    // Helper method to retry failed requests
    protected async retryRequest<T>(
        fn: () => Promise<T>,
        retries: number = this.maxRetries
    ): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            if (retries > 0) {
                console.log(`Retrying request for ${this.name}, ${retries} attempts remaining...`);
                await this.delay(this.requestDelay * 2);
                return this.retryRequest(fn, retries - 1);
            }
            throw error;
        }
    }

    // Helper to generate unique ID
    protected generateId(source: string, identifier: string): string {
        return `${source}-${identifier}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    }

    // Helper to extract price from text
    protected extractPrice(text: string): number {
        const match = text.match(/[\$]?([\d,]+\.?\d*)/);
        if (match) {
            return parseFloat(match[1].replace(/,/g, ''));
        }
        return 0;
    }

    // Helper to extract year from text
    protected extractYear(text: string): number | undefined {
        const match = text.match(/\b(1[7-9]\d{2}|20[0-2]\d)\b/);
        return match ? parseInt(match[1]) : undefined;
    }

    // Helper to extract grade from text
    protected extractGrade(text: string): string | undefined {
        // Common grades: MS70, MS69, PR70, PF70, AU58, etc.
        const grades = ['MS', 'PR', 'PF', 'SP', 'AU', 'XF', 'VF', 'F', 'VG', 'G', 'AG', 'FA', 'PO'];
        const gradeRegex = new RegExp(`\\b(${grades.join('|')})\\s?(\\d{1,2})\\b`, 'i');
        const match = text.match(gradeRegex);
        return match ? match[0].toUpperCase() : undefined;
    }

    // Helper to extract mint mark from text
    protected extractMint(text: string): string | undefined {
        // Common US Mint Marks: P, D, S, W, CC, O
        if (text.toLowerCase().includes('san francisco')) return 'S';
        if (text.toLowerCase().includes('philadelphia')) return 'P';
        if (text.toLowerCase().includes('denver')) return 'D';
        if (text.toLowerCase().includes('west point')) return 'W';
        if (text.toLowerCase().includes('carson city')) return 'CC';
        if (text.toLowerCase().includes('new orleans')) return 'O';

        // Simple regex for suffix mint marks like "2023-W" or "2023 W"
        const match = text.match(/\d{4}[\s-]?([PDSW])\b/i);
        return match ? match[1].toUpperCase() : undefined;
    }

    // Helper to extract certification
    protected extractCertification(text: string): string | undefined {
        if (text.toUpperCase().includes('PCGS')) return 'PCGS';
        if (text.toUpperCase().includes('NGC')) return 'NGC';
        if (text.toUpperCase().includes('ANACS')) return 'ANACS';
        if (text.toUpperCase().includes('ICG')) return 'ICG';
        return undefined;
    }

    // Log scraping activity
    protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${this.name}]`;

        switch (level) {
            case 'error':
                console.error(`${prefix} ERROR: ${message}`);
                break;
            case 'warn':
                console.warn(`${prefix} WARN: ${message}`);
                break;
            default:
                console.log(`${prefix} ${message}`);
        }
    }
}
