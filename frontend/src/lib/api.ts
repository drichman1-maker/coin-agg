const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://price-aggregator-api-production.up.railway.app/api';

// ─── Coin Types (existing) ───────────────────────────────────────────────────

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

// ─── Product Types (new) ─────────────────────────────────────────────────────

export interface Retailer {
    name: string;
    url: string;
    price: number;
    currency: string;
    availability: 'in_stock' | 'out_of_stock' | 'pre_order' | 'unknown';
    lastChecked: string;
}

export interface ProductSpecs {
    [key: string]: string | number | boolean;
}

export interface Product {
    id: string;
    name: string;
    brand: string;
    category: string;
    description: string;
    imageUrl?: string;
    specs: ProductSpecs;
    retailers: Retailer[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductFilters {
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
}

// ─── Coin API Functions (existing) ───────────────────────────────────────────

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

// ─── Product API Functions (new) ─────────────────────────────────────────────

export async function fetchProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
        }
    });

    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);

    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }

    return response.json();
}

export async function fetchProductById(id: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);

    if (!response.ok) {
        throw new Error('Failed to fetch product');
    }

    return response.json();
}

export async function fetchProductRetailers(id: string): Promise<Retailer[]> {
    const response = await fetch(`${API_BASE_URL}/products/${id}/retailers`);

    if (!response.ok) {
        throw new Error('Failed to fetch retailers');
    }

    return response.json();
}

export async function fetchProductCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/products/categories/list`);

    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }

    return response.json();
}

// ─── Utility Functions ───────────────────────────────────────────────────────

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

export function getLowestPrice(product: Product): number {
    if (product.retailers.length === 0) return 0;
    return Math.min(...product.retailers.map(r => r.price));
}

export function getHighestPrice(product: Product): number {
    if (product.retailers.length === 0) return 0;
    return Math.max(...product.retailers.map(r => r.price));
}

export function getPriceSavings(product: Product): number {
    return getHighestPrice(product) - getLowestPrice(product);
}
