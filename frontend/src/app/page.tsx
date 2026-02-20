'use client';

import { useState, useEffect } from 'react';
import { fetchCoins, Coin, CoinFilters, PaginatedResponse, getExportUrl } from '@/lib/api';
import CoinCard from '@/components/CoinCard';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import { useWatchlist } from '@/hooks/useWatchlist';
import { CategoryNav } from '@/components/shared-ui';
import styles from './page.module.css';

export default function HomePage() {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 24,
        total: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState<CoinFilters>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFavorites, setShowFavorites] = useState(false);

    const { watchlist, watchlistCount } = useWatchlist();

    const loadCoins = async (newFilters: CoinFilters = {}, page: number = 1) => {
        setLoading(true);
        setError(null);

        // Merge passed filters with current state filters if needed, but primarily use arguments
        const activeFilters = { ...newFilters };

        // If showFavorites is true, add ids to filter
        if (showFavorites) {
            if (watchlist.length === 0) {
                setCoins([]);
                setPagination({ ...pagination, total: 0, totalPages: 0 });
                setLoading(false);
                return;
            }
            activeFilters.ids = watchlist;
        }

        try {
            const response: PaginatedResponse<Coin> = await fetchCoins({
                ...activeFilters,
                page,
                limit: 24,
            });

            setCoins(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Failed to load coins. Please try again later.');
            console.error('Error loading coins:', err);
        } finally {
            setLoading(false);
        }
    };

    // Re-load coins when filters, favorites toggle, or watchlist changes (if toggle is active)
    useEffect(() => {
        loadCoins(filters, 1);
    }, [showFavorites, watchlist]); // If watchlist changes while showing favorites, reload

    const handleSearch = (query: string) => {
        const newFilters = { ...filters, search: query };
        setFilters(newFilters);
        loadCoins(newFilters, 1);
    };

    const handleFilterChange = (newFilters: CoinFilters) => {
        setFilters(newFilters);
        loadCoins(newFilters, 1);
    };

    const handlePageChange = (newPage: number) => {
        loadCoins(filters, newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleExport = () => {
        const activeFilters = { ...filters };
        if (showFavorites) {
            if (watchlist.length === 0) return;
            activeFilters.ids = watchlist;
        }

        // Use window.location to trigger download
        const url = getExportUrl(activeFilters);
        window.open(url, '_blank');
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <h1 className={styles.logo}>
                                <span className={styles.logoIcon}>🪙</span>
                                <span className="gradient-text">Coin Aggregator</span>
                            </h1>
                            <CategoryNav activeCategory="coins" />
                        </div>
                        <p className={styles.tagline}>
                            Discover collectible coins from reputable dealers across the internet
                        </p>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h2 className={styles.heroTitle}>
                            Find Your Next <span className="gradient-text">Treasure</span>
                        </h2>
                        <p className={styles.heroDescription}>
                            Browse thousands of collectible coins from trusted sources, all in one place
                        </p>
                        <div className={styles.searchWrapper}>
                            <SearchBar onSearch={handleSearch} placeholder="Search by coin name, year, or type..." />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className={styles.main}>
                <div className="container">
                    <div className={styles.layout}>
                        {/* Sidebar */}
                        <aside className={styles.sidebar}>
                            <div className={styles.watchlistToggle}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={showFavorites}
                                        onChange={(e) => setShowFavorites(e.target.checked)}
                                    />
                                    <span className={styles.checkboxText}>
                                        Show Favorites Only ({watchlistCount})
                                    </span>
                                </label>

                                {showFavorites && watchlistCount > 0 && (
                                    <button onClick={handleExport} className={styles.exportButton}>
                                        ↓ Export CSV
                                    </button>
                                )}
                            </div>

                            <div className={styles.sidebarActions}>
                                <button onClick={handleExport} className={styles.exportButtonSecondary}>
                                    ↓ Export Search Results
                                </button>
                            </div>

                            <FilterPanel onFilterChange={handleFilterChange} />

                            <div className={styles.stats}>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{pagination.total.toLocaleString()}</div>
                                    <div className={styles.statLabel}>Total Coins</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>
                                        {Array.from(new Set(coins.map(c => c.sourceName))).length || (pagination.total > 0 ? 5 : 0)}
                                    </div>
                                    <div className={styles.statLabel}>Sources</div>
                                </div>
                            </div>
                        </aside>

                        {/* Coin Grid */}
                        <div className={styles.content}>
                            {loading && (
                                <div className={styles.loading}>
                                    <div className={styles.spinner}></div>
                                    <p>Loading coins...</p>
                                </div>
                            )}

                            {error && (
                                <div className={styles.error}>
                                    <p>{error}</p>
                                    <button onClick={() => loadCoins(filters, pagination.page)} className="btn btn-primary">
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {!loading && !error && coins.length === 0 && (
                                <div className={styles.empty}>
                                    <span className={styles.emptyIcon}>🔍</span>
                                    <h3>No coins found</h3>
                                    <p>Try adjusting your search or filters</p>
                                </div>
                            )}

                            {!loading && !error && coins.length > 0 && (
                                <>
                                    <div className={styles.resultsHeader}>
                                        <p className={styles.resultsCount}>
                                            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} coins
                                        </p>
                                    </div>

                                    <div className={styles.grid}>
                                        {coins.map((coin) => (
                                            <CoinCard key={coin.id} coin={coin} />
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
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="container">
                    <p>© 2026 Coin Aggregator. Data sourced from reputable dealers.</p>
                </div>
            </footer>
        </div>
    );
}
