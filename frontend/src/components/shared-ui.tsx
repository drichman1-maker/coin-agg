'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Product, Retailer, formatPrice, getLowestPrice, getHighestPrice, getPriceSavings } from '@/lib/api';
import styles from './shared-ui.module.css';

// ─── CategoryNav ─────────────────────────────────────────────────────────────

interface CategoryNavProps {
    activeCategory: string;
}

export function CategoryNav({ activeCategory }: CategoryNavProps) {
    const categories = [
        { key: 'coins', label: '🪙 Coins', href: '/' },
        { key: 'products', label: '💻 Products', href: '/products' },
    ];

    return (
        <nav className={styles.categoryNav}>
            {categories.map(cat => (
                <Link
                    key={cat.key}
                    href={cat.href}
                    className={`${styles.categoryTab} ${activeCategory === cat.key ? styles.categoryTabActive : ''}`}
                >
                    {cat.label}
                </Link>
            ))}
        </nav>
    );
}

// ─── SearchInput ─────────────────────────────────────────────────────────────

interface SearchInputProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    debounceMs?: number;
}

export function SearchInput({ onSearch, placeholder = 'Search products...', debounceMs = 300 }: SearchInputProps) {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [query, debounceMs]);

    return (
        <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className={styles.searchInput}
                id="shared-search-input"
            />
            {query && (
                <button
                    className={styles.searchClear}
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    );
}

// ─── FilterBar ───────────────────────────────────────────────────────────────

interface FilterBarProps {
    filters: string[];
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

export function FilterBar({ filters, activeFilter, onFilterChange }: FilterBarProps) {
    return (
        <div className={styles.filterBar}>
            <button
                className={`${styles.filterChip} ${activeFilter === '' ? styles.filterChipActive : ''}`}
                onClick={() => onFilterChange('')}
            >
                All
            </button>
            {filters.map(filter => (
                <button
                    key={filter}
                    className={`${styles.filterChip} ${activeFilter === filter ? styles.filterChipActive : ''}`}
                    onClick={() => onFilterChange(filter)}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
}

// ─── ProductCard ─────────────────────────────────────────────────────────────

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const lowest = getLowestPrice(product);
    const savings = getPriceSavings(product);
    const inStockCount = product.retailers.filter(r => r.availability === 'in_stock').length;

    return (
        <Link href={`/products/${product.id}`} className={styles.productCard} id={`product-${product.id}`}>
            <div className={styles.productImageWrap}>
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={styles.productImage}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.productImagePlaceholder}>
                        <span>💻</span>
                    </div>
                )}
                <div className={styles.productBadge}>{product.brand}</div>
                {savings > 0 && (
                    <div className={styles.savingsBadge}>
                        Save {formatPrice(savings)}
                    </div>
                )}
            </div>

            <div className={styles.productContent}>
                <span className={styles.productCategory}>{product.category}</span>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>

                {product.specs && (
                    <div className={styles.productSpecs}>
                        {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
                            <span key={key} className={styles.specTag}>
                                {String(val)}
                            </span>
                        ))}
                    </div>
                )}

                <div className={styles.productFooter}>
                    <div className={styles.productPricing}>
                        <span className={styles.priceFrom}>from</span>
                        <span className={styles.priceValue}>{formatPrice(lowest)}</span>
                    </div>
                    <div className={styles.retailerCount}>
                        {inStockCount} retailer{inStockCount !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ─── RetailerList ────────────────────────────────────────────────────────────

interface RetailerListProps {
    retailers: Retailer[];
    productName: string;
}

export function RetailerList({ retailers, productName }: RetailerListProps) {
    const sorted = [...retailers].sort((a, b) => a.price - b.price);
    const lowestPrice = sorted.length > 0 ? sorted[0].price : 0;

    return (
        <div className={styles.retailerList}>
            <h4 className={styles.retailerListTitle}>
                Compare Prices ({retailers.length} retailer{retailers.length !== 1 ? 's' : ''})
            </h4>
            {sorted.map((retailer, idx) => (
                <a
                    key={`${retailer.name}-${idx}`}
                    href={retailer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.retailerRow} ${idx === 0 ? styles.retailerBest : ''}`}
                    id={`retailer-${retailer.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                    <div className={styles.retailerInfo}>
                        <span className={styles.retailerName}>{retailer.name}</span>
                        {idx === 0 && <span className={styles.bestPriceBadge}>Best Price</span>}
                        <span className={`${styles.availabilityDot} ${styles[retailer.availability]}`} />
                        <span className={styles.availabilityText}>
                            {retailer.availability === 'in_stock' ? 'In Stock' :
                                retailer.availability === 'out_of_stock' ? 'Out of Stock' :
                                    retailer.availability === 'pre_order' ? 'Pre-Order' : 'Unknown'}
                        </span>
                    </div>
                    <div className={styles.retailerPricing}>
                        <span className={styles.retailerPrice}>
                            {formatPrice(retailer.price, retailer.currency)}
                        </span>
                        {retailer.price > lowestPrice && (
                            <span className={styles.priceDiff}>
                                +{formatPrice(retailer.price - lowestPrice)}
                            </span>
                        )}
                    </div>
                    <span className={styles.retailerArrow}>→</span>
                </a>
            ))}
        </div>
    );
}

// ─── PriceComparison ─────────────────────────────────────────────────────────

interface PriceComparisonProps {
    retailers: Retailer[];
}

export function PriceComparison({ retailers }: PriceComparisonProps) {
    if (retailers.length === 0) return null;

    const sorted = [...retailers].sort((a, b) => a.price - b.price);
    const maxPrice = Math.max(...retailers.map(r => r.price));
    const minPrice = Math.min(...retailers.map(r => r.price));

    return (
        <div className={styles.priceComparison}>
            <h4 className={styles.priceComparisonTitle}>Price Comparison</h4>
            <div className={styles.priceBarChart}>
                {sorted.map((retailer, idx) => {
                    const barWidth = maxPrice > 0 ? (retailer.price / maxPrice) * 100 : 0;
                    return (
                        <div key={`${retailer.name}-${idx}`} className={styles.priceBarRow}>
                            <span className={styles.priceBarLabel}>{retailer.name}</span>
                            <div className={styles.priceBarTrack}>
                                <div
                                    className={`${styles.priceBarFill} ${retailer.price === minPrice ? styles.priceBarBest : ''}`}
                                    style={{ width: `${barWidth}%` }}
                                />
                            </div>
                            <span className={styles.priceBarValue}>
                                {formatPrice(retailer.price, retailer.currency)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── LoadingSpinner ──────────────────────────────────────────────────────────

export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className={styles.loadingWrapper}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>{message}</p>
        </div>
    );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
    icon?: string;
    title?: string;
    message?: string;
}

export function EmptyState({
    icon = '🔍',
    title = 'No results found',
    message = 'Try adjusting your search or filters'
}: EmptyStateProps) {
    return (
        <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>{icon}</span>
            <h3 className={styles.emptyTitle}>{title}</h3>
            <p className={styles.emptyMessage}>{message}</p>
        </div>
    );
}
