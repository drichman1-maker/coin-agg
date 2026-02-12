const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
    availability: string;
    createdAt: string;
    updatedAt: string;
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

export interface CoinFilters {
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
    page?: number;
    limit?: number;
    ids?: string[];
}

export async function fetchCoins(filters: CoinFilters = {}): Promise<PaginatedResponse<Coin>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                params.append(key, value.join(','));
            } else {
                params.append(key, value.toString());
            }
        }
    });

    const response = await fetch(`${API_BASE_URL}/coins?${params.toString()}`);

    if (!response.ok) {
        throw new Error('Failed to fetch coins');
    }

    return response.json();
}

export async function fetchCoinById(id: string): Promise<Coin> {
    const response = await fetch(`${API_BASE_URL}/coins/${id}`);

    if (!response.ok) {
        throw new Error('Failed to fetch coin');
    }

    return response.json();
}

export async function fetchSimilarCoins(id: string): Promise<Coin[]> {
    const response = await fetch(`${API_BASE_URL}/coins/${id}/similar`);
    if (!response.ok) {
        throw new Error('Failed to fetch similar coins');
    }
    return response.json();
}

export async function refreshCoins(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/coins/refresh`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to refresh coins');
    }
}

export function formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(price);
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function getExportUrl(filters: CoinFilters = {}): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                params.append(key, value.join(','));
            } else {
                params.append(key, value.toString());
            }
        }
    });

    return `${API_BASE_URL}/coins/export?${params.toString()}`;
}
