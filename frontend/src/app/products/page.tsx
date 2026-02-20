'use client';

import { useState, useEffect } from 'react';
import { fetchProducts, fetchProductCategories, Product, ProductFilters, PaginatedResponse } from '@/lib/api';
import { CategoryNav, SearchInput, FilterBar, ProductCard, LoadingSpinner, EmptyState } from '@/components/shared-ui';
import styles from './products.module.css';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 24,
        total: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState<ProductFilters>({});
    const [activeCategory, setActiveCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProducts = async (newFilters: ProductFilters = {}, page: number = 1) => {
        setLoading(true);
        setError(null);

        try {
            const response: PaginatedResponse<Product> = await fetchProducts({
                ...newFilters,
                page,
                limit: 24,
            });

            setProducts(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Failed to load products. Please try again later.');
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const cats = await fetchProductCategories();
            setCategories(cats);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    useEffect(() => {
        loadProducts(filters, 1);
        loadCategories();
    }, []);

    const handleSearch = (query: string) => {
        const newFilters = { ...filters, search: query };
        setFilters(newFilters);
        loadProducts(newFilters, 1);
    };

    const handleCategoryFilter = (category: string) => {
        setActiveCategory(category);
        const newFilters = { ...filters, category: category || undefined };
        setFilters(newFilters);
        loadProducts(newFilters, 1);
    };

    const handlePageChange = (newPage: number) => {
        loadProducts(filters, newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <div className={styles.headerTop}>
                            <h1 className={styles.logo}>
                                <span className={styles.logoIcon}>💻</span>
                                <span className="gradient-text">Product Tracker</span>
                            </h1>
                            <CategoryNav activeCategory="products" />
                        </div>
                        <p className={styles.tagline}>
                            Compare prices across retailers — direct links to the best deals
                        </p>
                    </div>
                </div>
            </header>

            {/* Hero / Search Section */}
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h2 className={styles.heroTitle}>
                            Find the <span className="gradient-text">Best Price</span>
                        </h2>
                        <p className={styles.heroDescription}>
                            Browse Apple products with real-time prices from trusted retailers
                        </p>
                        <div className={styles.searchWrapper}>
                            <SearchInput
                                onSearch={handleSearch}
                                placeholder="Search products by name, brand, or category..."
                            />
                        </div>
                        {categories.length > 0 && (
                            <FilterBar
                                filters={categories}
                                activeFilter={activeCategory}
                                onFilterChange={handleCategoryFilter}
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className={styles.main}>
                <div className="container">
                    {loading && <LoadingSpinner message="Loading products..." />}

                    {error && (
                        <div className={styles.error}>
                            <p>{error}</p>
                            <button onClick={() => loadProducts(filters, pagination.page)} className="btn btn-primary">
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && products.length === 0 && (
                        <EmptyState
                            icon="💻"
                            title="No products found"
                            message="Try adjusting your search or category filters"
                        />
                    )}

                    {!loading && !error && products.length > 0 && (
                        <>
                            <div className={styles.resultsHeader}>
                                <p className={styles.resultsCount}>
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                                </p>
                            </div>

                            <div className={styles.grid}>
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className={styles.paginationButton}
                                    >
                                        ← Previous
                                    </button>

                                    <div className={styles.paginationInfo}>
                                        Page {pagination.page} of {pagination.totalPages}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className={styles.paginationButton}
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="container">
                    <p>© 2026 Price Aggregator. Prices from authorized retailers.</p>
                </div>
            </footer>
        </div>
    );
}
