export interface Coin {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    year?: number;
    mint?: string;
    grade?: string;
    certification?: string;
    coinType: string;
    imageUrl?: string;
    sourceUrl: string;
    sourceName: string;
    availability: 'in_stock' | 'out_of_stock' | 'pre_order' | 'unknown';
    createdAt: string;
    updatedAt: string;
}

export interface CoinFilter {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    grade?: string;
    certification?: string;
    coinType?: string;
    source?: string;
    availability?: string;
    ids?: string[]; // Array of IDs to filter by
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface DataSource {
    name: string;
    displayName: string;
    enabled: boolean;
    lastScraped?: string;
    coinCount: number;
}

export interface ScraperConfig {
    name: string;
    baseUrl: string;
    enabled: boolean;
    requestDelay: number;
    maxRetries: number;
}
