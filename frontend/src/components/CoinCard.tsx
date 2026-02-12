import Link from 'next/link';
import { Coin, formatPrice } from '@/lib/api';
import { useWatchlist } from '@/hooks/useWatchlist';
import styles from './CoinCard.module.css';

interface CoinCardProps {
    coin: Coin;
}

export default function CoinCard({ coin }: CoinCardProps) {
    const { isInWatchlist, toggleWatchlist } = useWatchlist();
    const isFavorite = isInWatchlist(coin.id);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        toggleWatchlist(coin.id);
    };

    return (
        <Link href={`/coins/${coin.id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                <button
                    className={`${styles.favoriteButton} ${isFavorite ? styles.active : ''}`}
                    onClick={handleFavoriteClick}
                    aria-label={isFavorite ? "Remove from watchlist" : "Add to watchlist"}
                >
                    {isFavorite ? '★' : '☆'}
                </button>
                {coin.imageUrl ? (
                    <img
                        src={coin.imageUrl}
                        alt={coin.title}
                        className={styles.image}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <span className={styles.placeholderIcon}>🪙</span>
                    </div>
                )}
                <div className={styles.sourceBadge}>
                    {coin.sourceName}
                </div>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{coin.title}</h3>

                <div className={styles.details}>
                    {coin.year && (
                        <span className={styles.detail}>
                            <span className={styles.detailLabel}>Year:</span> {coin.year}
                        </span>
                    )}
                    {coin.grade && (
                        <span className={styles.detail}>
                            <span className={styles.detailLabel}>Grade:</span> {coin.grade}
                        </span>
                    )}
                    {coin.coinType && (
                        <span className={styles.detail}>
                            <span className={styles.detailLabel}>Type:</span> {coin.coinType}
                        </span>
                    )}
                </div>

                <div className={styles.footer}>
                    <div className={styles.price}>
                        {formatPrice(coin.price, coin.currency)}
                    </div>
                    <div className={styles.availability}>
                        {coin.availability === 'in_stock' && '✓ In Stock'}
                        {coin.availability === 'out_of_stock' && '✗ Out of Stock'}
                        {coin.availability === 'pre_order' && '⏰ Pre-Order'}
                    </div>
                </div>
            </div>
        </Link>
    );
}
