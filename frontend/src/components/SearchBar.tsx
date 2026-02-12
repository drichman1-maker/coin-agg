'use client';

import { useState, useEffect } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search coins...' }: SearchBarProps) {
    const [query, setQuery] = useState('');

    // Debounced search effect
    useEffect(() => {
        if (query === '') {
            onSearch('');
            return;
        }

        const timeoutId = setTimeout(() => {
            onSearch(query);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query, onSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.searchForm}>
            <div className={styles.searchContainer}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={styles.searchInput}
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        className={styles.clearButton}
                    >
                        ✕
                    </button>
                )}
            </div>
        </form>
    );
}
