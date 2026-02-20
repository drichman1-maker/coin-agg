export interface Retailer {
    name: string;
    url: string; // Direct product page URL (not search)
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

export interface ProductFilter {
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
}

export interface PaginatedProductResponse {
    data: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
