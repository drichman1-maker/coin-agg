import { CoinDatabase, initDatabase } from './database/schema';
import { Coin } from './types/coin';

const mockCoins: Omit<Coin, 'createdAt' | 'updatedAt'>[] = [
    {
        id: 'mock-1',
        title: '2024 1 oz American Gold Eagle BU',
        description: 'The American Gold Eagle is the official gold bullion coin of the United States.',
        price: 2150.50,
        currency: 'USD',
        year: 2024,
        mint: 'W',
        grade: 'BU',
        coinType: 'Gold',
        imageUrl: 'https://www.apmex.com/images/products/2024-1-oz-american-gold-eagle-bu_281488_t.jpg',
        sourceUrl: 'https://www.apmex.com/product/281488/2024-1-oz-american-gold-eagle-bu',
        sourceName: 'APMEX',
        availability: 'in_stock'
    },
    {
        id: 'mock-1b',
        title: '2024 1 oz American Gold Eagle BU',
        description: 'The American Gold Eagle is the official gold bullion coin of the United States.',
        price: 2175.00,
        currency: 'USD',
        year: 2024,
        mint: 'W',
        grade: 'BU',
        coinType: 'Gold',
        imageUrl: 'https://www.jmbullion.com/images/products/2024-1-oz-american-gold-eagle-bu_281488_t.jpg',
        sourceUrl: 'https://www.jmbullion.com/2024-1-oz-american-gold-eagle-bu/',
        sourceName: 'JM Bullion',
        availability: 'in_stock'
    },
    {
        id: 'mock-1c',
        title: '2024 American Gold Eagle 1 oz Brilliant Uncirculated',
        description: 'The American Gold Eagle is the official gold bullion coin of the United States.',
        price: 2165.75,
        currency: 'USD',
        year: 2024,
        mint: 'W',
        grade: 'BU',
        coinType: 'Gold',
        imageUrl: 'https://monumentmetals.com/images/products/2024-1-oz-american-gold-eagle-bu.jpg',
        sourceUrl: 'https://monumentmetals.com/2024-1-oz-american-gold-eagle-bu.html',
        sourceName: 'Monument Metals',
        availability: 'in_stock'
    },
    {
        id: 'mock-2',
        title: '2024 1 oz American Silver Eagle BU',
        description: 'The Silver American Eagle is the official investment-grade silver bullion coin of the United States.',
        price: 32.75,
        currency: 'USD',
        year: 2024,
        mint: 'P',
        grade: 'BU',
        coinType: 'Silver',
        imageUrl: 'https://www.jmbullion.com/images/products/2024-1-oz-american-silver-eagle-bu_281512_t.jpg',
        sourceUrl: 'https://www.jmbullion.com/2024-1-oz-american-silver-eagle-bu/',
        sourceName: 'JM Bullion',
        availability: 'in_stock'
    },
    {
        id: 'mock-2b',
        title: '2024 American Silver Eagle 1 oz BU',
        description: 'The Silver American Eagle is the official investment-grade silver bullion coin of the United States.',
        price: 33.50,
        currency: 'USD',
        year: 2024,
        mint: 'P',
        grade: 'BU',
        coinType: 'Silver',
        imageUrl: 'https://www.apmex.com/images/products/2024-1-oz-american-silver-eagle-bu.jpg',
        sourceUrl: 'https://www.apmex.com/product/2024-1-oz-american-silver-eagle-bu',
        sourceName: 'APMEX',
        availability: 'in_stock'
    },
    {
        id: 'mock-2c',
        title: '2024 1 oz Silver American Eagle Brilliant Uncirculated',
        description: 'The Silver American Eagle is the official investment-grade silver bullion coin of the United States.',
        price: 31.99,
        currency: 'USD',
        year: 2024,
        mint: 'P',
        grade: 'BU',
        coinType: 'Silver',
        imageUrl: 'https://monumentmetals.com/images/products/2024-silver-eagle.jpg',
        sourceUrl: 'https://monumentmetals.com/2024-silver-american-eagle.html',
        sourceName: 'Monument Metals',
        availability: 'in_stock'
    },
    {
        id: 'mock-3',
        title: '1924 Saint-Gaudens Gold Double Eagle MS-64 PCGS',
        description: 'High quality Saint-Gaudens Double Eagle from the Roaring Twenties.',
        price: 2450.00,
        currency: 'USD',
        year: 1924,
        mint: 'P',
        grade: 'MS-64',
        certification: 'PCGS',
        coinType: 'Gold',
        imageUrl: 'https://static.herobullion.com/wp-content/uploads/2023/10/1924-Saint-Gaudens-Gold-Double-Eagle-MS-64-PCGS.jpg',
        sourceUrl: 'https://www.herobullion.com/1924-saint-gaudens-gold-double-eagle-ms-64-pcgs/',
        sourceName: 'Hero Bullion',
        availability: 'in_stock'
    },
    {
        id: 'mock-4',
        title: '1881-S Morgan Silver Dollar MS-65 NGC',
        description: 'Beautifully toned Morgan Silver Dollar with high grade.',
        price: 185.00,
        currency: 'USD',
        year: 1881,
        mint: 'S',
        grade: 'MS-65',
        certification: 'NGC',
        coinType: 'Silver',
        imageUrl: 'https://i.ebayimg.com/images/g/foo/s-l1600.jpg',
        sourceUrl: 'https://www.ebay.com/itm/123456',
        sourceName: 'eBay',
        availability: 'in_stock'
    },
    {
        id: 'mock-5',
        title: '2023 Morgan Silver Dollar Uncirculated',
        description: 'The modern rendition of the classic Morgan Silver Dollar.',
        price: 85.00,
        currency: 'USD',
        year: 2023,
        mint: 'P',
        grade: 'Uncirculated',
        coinType: 'Silver',
        imageUrl: 'https://catalog.usmint.gov/on/demandware.static/-/Sites-usm-master-catalog-us/default/dw7e5a7b8e/images/2023/23XC_A.jpg',
        sourceUrl: 'https://catalog.usmint.gov/morgan-2023-silver-dollar-uncirculated-23XC.html',
        sourceName: 'US Mint',
        availability: 'in_stock'
    }
];

async function seed() {
    console.log('Seeding database with mock data...');
    await initDatabase();
    await CoinDatabase.bulkUpsertCoins(mockCoins);
    console.log('Seeding completed successfully!');
    process.exit(0);
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
