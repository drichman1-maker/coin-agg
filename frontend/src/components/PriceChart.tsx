'use client';

import { useState } from 'react';
import styles from './PriceChart.module.css';

interface PriceDataPoint {
    source: string;
    price: number;
    availability: string;
    url: string;
}

interface PriceChartProps {
    data: PriceDataPoint[];
    currency?: string;
}

export default function PriceChart({ data, currency = 'USD' }: PriceChartProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (data.length === 0) {
        return null;
    }

    const maxPrice = Math.max(...data.map(d => d.price));
    const minPrice = Math.min(...data.map(d => d.price));
    const priceRange = maxPrice - minPrice;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(price);
    };

    return (
        <div className={`${styles.container} ${isExpanded ? styles.expanded : ''}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    <span className={styles.icon}>📊</span>
                    Price Comparison Across Sources
                </h3>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={styles.expandButton}
                    aria-label={isExpanded ? 'Collapse chart' : 'Expand chart'}
                >
                    {isExpanded ? '⊟' : '⊞'}
                </button>
            </div>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <div className={styles.statLabel}>Lowest</div>
                    <div className={styles.statValue}>{formatPrice(minPrice)}</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statLabel}>Highest</div>
                    <div className={styles.statValue}>{formatPrice(maxPrice)}</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statLabel}>Difference</div>
                    <div className={styles.statValue}>{formatPrice(priceRange)}</div>
                </div>
            </div>

            <div className={styles.chart}>
                {data.map((item, index) => {
                    const barHeight = priceRange > 0
                        ? ((item.price - minPrice) / priceRange) * 100
                        : 50;
                    const isLowest = item.price === minPrice;
                    const isHighest = item.price === maxPrice;

                    return (
                        <div key={index} className={styles.barContainer}>
                            <div className={styles.barWrapper}>
                                <div
                                    className={`${styles.bar} ${isLowest ? styles.lowest : ''} ${isHighest ? styles.highest : ''}`}
                                    style={{ height: `${Math.max(barHeight, 10)}%` }}
                                >
                                    <div className={styles.barLabel}>
                                        {formatPrice(item.price)}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.sourceLabel}>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.sourceLink}
                                >
                                    {item.source}
                                </a>
                                <div className={styles.availability}>
                                    {item.availability === 'in_stock' && '✓'}
                                    {item.availability === 'out_of_stock' && '✗'}
                                    {item.availability === 'pre_order' && '⏰'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
