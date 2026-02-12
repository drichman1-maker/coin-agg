
import { Coin } from '../types/coin';

export class CsvService {
    static convertToCsv(coins: Coin[]): string {
        if (coins.length === 0) {
            return '';
        }

        // Define headers
        const headers = [
            'ID',
            'Title',
            'Price',
            'Currency',
            'Year',
            'Mint',
            'Grade',
            'Certification',
            'Type',
            'Source',
            'Availability',
            'URL'
        ];

        // Create CSV rows
        const rows = coins.map(coin => {
            return [
                this.escapeField(coin.id),
                this.escapeField(coin.title),
                this.escapeField(coin.price.toString()),
                this.escapeField(coin.currency),
                this.escapeField(coin.year?.toString() || ''),
                this.escapeField(coin.mint || ''),
                this.escapeField(coin.grade || ''),
                this.escapeField(coin.certification || ''),
                this.escapeField(coin.coinType),
                this.escapeField(coin.sourceName),
                this.escapeField(coin.availability),
                this.escapeField(coin.sourceUrl)
            ].join(',');
        });

        // Combine headers and rows
        return [headers.join(','), ...rows].join('\n');
    }

    private static escapeField(field: string): string {
        if (field === null || field === undefined) {
            return '';
        }

        const stringField = field.toString();

        // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }

        return stringField;
    }
}
