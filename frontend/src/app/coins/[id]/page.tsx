'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCoinById, fetchSimilarCoins, Coin, formatPrice, formatDate } from '@/lib/api';
import PriceChart from '@/components/PriceChart';
import styles from './page.module.css';

export default function CoinDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [coin, setCoin] = useState<Coin | null>(null);
    const [similarCoins, setSimilarCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCoin = async () => {
            try {
                const data = await fetchCoinById(params.id);
                setCoin(data);

                // Fetch similar coins for price comparison
                try {
                    const similar = await fetchSimilarCoins(params.id);
                    setSimilarCoins(similar);
                } catch (err) {
                    console.error('Error loading similar coins:', err);
                    // Don't fail the whole page if similar coins fail
                }
            } catch (err) {
                setError('Failed to load coin details');
                console.error('Error loading coin:', err);
            } finally {
                setLoading(false);
            }
        };

        loadCoin();
    }, [params.id]);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading coin details...</p>
                </div>
            </div>
        );
    }

    if (error || !coin) {
        return (
            <div className={styles.page}>
                <div className={styles.error}>
                    <h2>Coin Not Found</h2>
                    <p>{error || 'The coin you are looking for does not exist.'}</p>
                    <button onClick={() => router.push('/')} className="btn btn-primary">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // Prepare price chart data
    const priceChartData = [
        {
            source: coin.sourceName,
            price: coin.price,
            availability: coin.availability,
            url: coin.sourceUrl,
        },
        ...similarCoins.map(c => ({
            source: c.sourceName,
            price: c.price,
            availability: c.availability,
            url: c.sourceUrl,
        })),
    ];

    return (
        <div className={styles.page}>
            <div className="container">
                <button onClick={() => router.push('/')} className={styles.backButton}>
                    ← Back to Coins
                </button>

                <div className={styles.content}>
                    <div className={styles.imageSection}>
                        {coin.imageUrl ? (
                            <img src={coin.imageUrl} alt={coin.title} className={styles.image} />
                        ) : (
                            <div className={styles.placeholder}>
                                <span className={styles.placeholderIcon}>🪙</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.details}>
                        <div className={styles.header}>
                            <span className={styles.sourceBadge}>{coin.sourceName}</span>
                            <h1 className={styles.title}>{coin.title}</h1>
                        </div>

                        <div className={styles.price}>
                            {formatPrice(coin.price, coin.currency)}
                        </div>

                        <div className={styles.availability}>
                            {coin.availability === 'in_stock' && (
                                <span className={styles.inStock}>✓ In Stock</span>
                            )}
                            {coin.availability === 'out_of_stock' && (
                                <span className={styles.outOfStock}>✗ Out of Stock</span>
                            )}
                            {coin.availability === 'pre_order' && (
                                <span className={styles.preOrder}>⏰ Pre-Order</span>
                            )}
                        </div>

                        <div className={styles.specs}>
                            <h2 className={styles.specsTitle}>Specifications</h2>
                            <div className={styles.specGrid}>
                                {coin.year && (
                                    <div className={styles.specItem}>
                                        <div className={styles.specLabel}>Year</div>
                                        <div className={styles.specValue}>{coin.year}</div>
                                    </div>
                                )}
                                {coin.coinType && (
                                    <div className={styles.specItem}>
                                        <div className={styles.specLabel}>Type</div>
                                        <div className={styles.specValue}>{coin.coinType}</div>
                                    </div>
                                )}
                                {coin.mint && (
                                    <div className={styles.specItem}>
                                        <div className={styles.specLabel}>Mint</div>
                                        <div className={styles.specValue}>{coin.mint}</div>
                                    </div>
                                )}
                                {coin.grade && (
                                    <div className={styles.specItem}>
                                        <div className={styles.specLabel}>Grade</div>
                                        <div className={styles.specValue}>{coin.grade}</div>
                                    </div>
                                )}
                                {coin.certification && (
                                    <div className={styles.specItem}>
                                        <div className={styles.specLabel}>Certification</div>
                                        <div className={styles.specValue}>{coin.certification}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {coin.description && (
                            <div className={styles.description}>
                                <h2 className={styles.descriptionTitle}>Description</h2>
                                <p>{coin.description}</p>
                            </div>
                        )}

                        <div className={styles.actions}>
                            <a
                                href={coin.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                            >
                                View on {coin.sourceName} →
                            </a>
                        </div>

                        <div className={styles.meta}>
                            <p className={styles.metaText}>
                                Last updated: {formatDate(coin.updatedAt)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Price Comparison Chart */}
                {priceChartData.length > 1 && (
                    <PriceChart data={priceChartData} currency={coin.currency} />
                )}
            </div>
        </div>
    );
}
