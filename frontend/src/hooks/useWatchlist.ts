'use client';

import { useState, useEffect } from 'react';

const WATCHLIST_KEY = 'coin_aggregator_watchlist';

export function useWatchlist() {
    const [watchlist, setWatchlist] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(WATCHLIST_KEY);
        if (stored) {
            setWatchlist(JSON.parse(stored));
        }
    }, []);

    const toggleWatchlist = (coinId: string) => {
        const newWatchlist = watchlist.includes(coinId)
            ? watchlist.filter(id => id !== coinId)
            : [...watchlist, coinId];

        setWatchlist(newWatchlist);
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist));
    };

    const isInWatchlist = (coinId: string) => watchlist.includes(coinId);
    const watchlistCount = watchlist.length;

    return { watchlist, toggleWatchlist, isInWatchlist, watchlistCount };
}
