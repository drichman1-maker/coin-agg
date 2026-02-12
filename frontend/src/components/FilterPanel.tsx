'use client';

import { useState } from 'react';
import { CoinFilters } from '@/lib/api';
import styles from './FilterPanel.module.css';

interface FilterPanelProps {
    onFilterChange: (filters: CoinFilters) => void;
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
    const [filters, setFilters] = useState<CoinFilters>({});
    const [isExpanded, setIsExpanded] = useState(false);

    const handleFilterChange = (key: keyof CoinFilters, value: any) => {
        const newFilters = { ...filters, [key]: value || undefined };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        setFilters({});
        onFilterChange({});
    };

    const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    Filters
                    {activeFilterCount > 0 && (
                        <span className={styles.badge}>{activeFilterCount}</span>
                    )}
                </h3>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={styles.toggleButton}
                >
                    {isExpanded ? '▼' : '▶'}
                </button>
            </div>

            <div className={`${styles.content} ${isExpanded ? styles.expanded : ''}`}>
                {/* Price Range */}
                <div className={styles.filterGroup}>
                    <label className={styles.label}>Price Range</label>
                    <div className={styles.rangeInputs}>
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice || ''}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className={styles.input}
                        />
                        <span className={styles.separator}>—</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice || ''}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className={styles.input}
                        />
                    </div>
                </div>

                {/* Year Range */}
                <div className={styles.filterGroup}>
                    <label className={styles.label}>Year Range</label>
                    <div className={styles.rangeInputs}>
                        <input
                            type="number"
                            placeholder="From"
                            value={filters.minYear || ''}
                            onChange={(e) => handleFilterChange('minYear', e.target.value ? parseInt(e.target.value) : undefined)}
                            className={styles.input}
                        />
                        <span className={styles.separator}>—</span>
                        <input
                            type="number"
                            placeholder="To"
                            value={filters.maxYear || ''}
                            onChange={(e) => handleFilterChange('maxYear', e.target.value ? parseInt(e.target.value) : undefined)}
                            className={styles.input}
                        />
                    </div>
                </div>

                {/* Coin Type */}
                <div className={styles.filterGroup}>
                    <label className={styles.label}>Coin Type</label>
                    <select
                        value={filters.coinType || ''}
                        onChange={(e) => handleFilterChange('coinType', e.target.value)}
                        className={styles.select}
                    >
                        <option value="">All Types</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Copper">Copper</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Source */}
                <div className={styles.filterGroup}>
                    <label className={styles.label}>Source</label>
                    <select
                        value={filters.source || ''}
                        onChange={(e) => handleFilterChange('source', e.target.value)}
                        className={styles.select}
                    >
                        <option value="">All Sources</option>
                        <option value="APMEX">APMEX</option>
                        <option value="JM Bullion">JM Bullion</option>
                    </select>
                </div>

                {/* Availability */}
                <div className={styles.filterGroup}>
                    <label className={styles.label}>Availability</label>
                    <select
                        value={filters.availability || ''}
                        onChange={(e) => handleFilterChange('availability', e.target.value)}
                        className={styles.select}
                    >
                        <option value="">All</option>
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="pre_order">Pre-Order</option>
                    </select>
                </div>

                {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className={styles.clearButton}>
                        Clear All Filters
                    </button>
                )}
            </div>
        </div>
    );
}
