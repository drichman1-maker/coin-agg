#!/usr/bin/env python3
"""
seed_data.py — Seed the unified backend with 10 Apple/Mac products (MacTrackr format).

Usage:
    python seed_data.py                          # POST to Railway API
    python seed_data.py --dry-run                # Print JSON only
    python seed_data.py --api-url http://...     # Custom API URL
"""

import json
import sys
import argparse
from datetime import datetime

API_BASE = "https://price-aggregator-api-production.up.railway.app/api"

now = datetime.utcnow().isoformat() + "Z"

products = [
    {
        "id": "macbook-air-m3-15",
        "name": "MacBook Air 15\" M3",
        "brand": "Apple",
        "category": "Laptops",
        "description": "Impossibly thin laptop with the M3 chip, 15.3-inch Liquid Retina display, 18 hours of battery life, and a fanless design.",
        "imageUrl": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba15-m3-midnight-select-202403",
        "specs": {
            "chip": "Apple M3",
            "display": "15.3-inch Liquid Retina",
            "ram": "8GB",
            "storage": "256GB SSD",
            "battery": "Up to 18 hours",
            "weight": "3.3 lbs"
        },
        "retailers": [
            {
                "name": "Apple",
                "url": "https://www.apple.com/shop/buy-mac/macbook-air/15-inch-macbook-air-m3-chip-8gb-memory-256gb",
                "price": 1299.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Best Buy",
                "url": "https://www.bestbuy.com/site/apple-macbook-air-15-inch-laptop-m3-chip-8gb-memory-256gb-ssd/6565837.p",
                "price": 1299.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "B&H Photo",
                "url": "https://www.bhphotovideo.com/c/product/1810288-REG/apple_mryq3ll_a_15_3_macbook_air_m3.html",
                "price": 1249.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Amazon",
                "url": "https://www.amazon.com/Apple-2024-MacBook-15-inch-Laptop/dp/B0CX23V2ZK",
                "price": 1279.99,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            }
        ],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "id": "macbook-pro-14-m3",
        "name": "MacBook Pro 14\" M3",
        "brand": "Apple",
        "category": "Laptops",
        "description": "Pro-level performance in a portable form factor with the M3 chip, Liquid Retina XDR display, and up to 22 hours battery.",
        "imageUrl": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-m3-space-gray-select-202310",
        "specs": {
            "chip": "Apple M3",
            "display": "14.2-inch Liquid Retina XDR",
            "ram": "8GB",
            "storage": "512GB SSD",
            "battery": "Up to 22 hours",
            "weight": "3.4 lbs"
        },
        "retailers": [
            {
                "name": "Apple",
                "url": "https://www.apple.com/shop/buy-mac/macbook-pro/14-inch-m3",
                "price": 1599.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Best Buy",
                "url": "https://www.bestbuy.com/site/apple-macbook-pro-14-inch-laptop-m3-chip-8gb-memory-512gb-ssd/6565840.p",
                "price": 1599.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "B&H Photo",
                "url": "https://www.bhphotovideo.com/c/product/1793634-REG/apple_mtl73ll_a_14_macbook_pro_m3.html",
                "price": 1549.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            }
        ],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "id": "macbook-pro-16-m3-max",
        "name": "MacBook Pro 16\" M3 Max",
        "brand": "Apple",
        "category": "Laptops",
        "description": "The ultimate pro laptop with M3 Max chip, 16.2-inch Liquid Retina XDR display, massive performance for demanding workflows.",
        "imageUrl": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-m3-max-space-black-select-202310",
        "specs": {
            "chip": "Apple M3 Max",
            "display": "16.2-inch Liquid Retina XDR",
            "ram": "36GB",
            "storage": "1TB SSD",
            "battery": "Up to 22 hours",
            "weight": "4.7 lbs"
        },
        "retailers": [
            {
                "name": "Apple",
                "url": "https://www.apple.com/shop/buy-mac/macbook-pro/16-inch-m3-max",
                "price": 3499.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Best Buy",
                "url": "https://www.bestbuy.com/site/apple-macbook-pro-16-inch-laptop-m3-max-chip-36gb-memory-1tb-ssd/6565860.p",
                "price": 3499.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Amazon",
                "url": "https://www.amazon.com/Apple-MacBook-Laptop-14%E2%80%91core-30%E2%80%91core/dp/B0CM5KK4B4",
                "price": 3449.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            }
        ],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "id": "imac-24-m3",
        "name": "iMac 24\" M3",
        "brand": "Apple",
        "category": "Desktops",
        "description": "All-in-one desktop with M3 chip, stunning 24-inch 4.5K Retina display in a remarkably thin design with bold colors.",
        "imageUrl": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/imac-m3-blue-select-202310",
        "specs": {
            "chip": "Apple M3",
            "display": "24-inch 4.5K Retina",
            "ram": "8GB",
            "storage": "256GB SSD",
            "ports": "2x Thunderbolt / USB 4",
            "weight": "9.83 lbs"
        },
        "retailers": [
            {
                "name": "Apple",
                "url": "https://www.apple.com/shop/buy-mac/imac/24-inch-m3",
                "price": 1299.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Best Buy",
                "url": "https://www.bestbuy.com/site/apple-imac-24-inch-m3-chip-8gb-memory-256gb-ssd/6565842.p",
                "price": 1299.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "B&H Photo",
                "url": "https://www.bhphotovideo.com/c/product/1793649-REG/apple_mqrq3ll_a_24_imac_m3_8_core.html",
                "price": 1249.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Amazon",
                "url": "https://www.amazon.com/Apple-2023-iMac-Desktop-Computer/dp/B0CM5BFRND",
                "price": 1279.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            }
        ],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "id": "mac-mini-m2",
        "name": "Mac mini M2",
        "brand": "Apple",
        "category": "Desktops",
        "description": "Compact powerhouse with M2 chip. The most affordable Mac, now with next-gen performance and versatile connectivity.",
        "imageUrl": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mac-mini-hero-202301",
        "specs": {
            "chip": "Apple M2",
            "ram": "8GB",
            "storage": "256GB SSD",
            "ports": "2x Thunderbolt 4, 2x USB-A, HDMI, Ethernet",
            "weight": "2.6 lbs"
        },
        "retailers": [
            {
                "name": "Apple",
                "url": "https://www.apple.com/shop/buy-mac/mac-mini",
                "price": 599.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Best Buy",
                "url": "https://www.bestbuy.com/site/apple-mac-mini-desktop-m2-chip-8gb-memory-256gb-ssd/6427500.p",
                "price": 599.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Amazon",
                "url": "https://www.amazon.com/Apple-2023-Mini-Desktop-Computer/dp/B0BSHGHGXR",
                "price": 479.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            }
        ],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "id": "mac-studio-m2-ultra",
        "name": "Mac Studio M2 Ultra",
        "brand": "Apple",
        "category": "Desktops",
        "description": "Outrageous performance in a compact form. The M2 Ultra chip delivers extraordinary power for the most demanding pro workflows.",
        "imageUrl": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mac-studio-select-202306",
        "specs": {
            "chip": "Apple M2 Ultra",
            "ram": "64GB",
            "storage": "1TB SSD",
            "ports": "6x Thunderbolt 4, 2x USB-A, HDMI, SDXC",
            "weight": "5.9 lbs"
        },
        "retailers": [
            {
                "name": "Apple",
                "url": "https://www.apple.com/shop/buy-mac/mac-studio",
                "price": 3999.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "B&H Photo",
                "url": "https://www.bhphotovideo.com/c/product/1765955-REG/apple_mqh63ll_a_mac_studio_m2_ultra.html",
                "price": 3999.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Amazon",
                "url": "https://www.amazon.com/Apple-Studio-Desktop-Computer-24-core/dp/B0C7LWBRWM",
                "price": 3899.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            }
        ],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "id": "mac-pro-m2-ultra",
        "name": "Mac Pro M2 Ultra",
        "brand": "Apple",
        "category": "Desktops",
        "description": "The most powerful Mac ever. M2 Ultra in a tower with massive expansion via PCIe slots, built for extreme workloads.",
        "imageUrl": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mac-pro-tower-select-202306",
        "specs": {
            "chip": "Apple M2 Ultra",
            "ram": "192GB",
            "storage": "1TB SSD",
            "expansion": "7 PCIe Gen 4 slots",
            "weight": "37.2 lbs"
        },
        "retailers": [
            {
                "name": "Apple",
                "url": "https://www.apple.com/shop/buy-mac/mac-pro",
                "price": 6999.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "B&H Photo",
                "url": "https://www.bhphotovideo.com/c/product/1765960-REG/apple_mqh43ll_a_mac_pro_tower_m2.html",
                "price": 6999.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            }
        ],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "id": "ipad-pro-13-m4",
        "name": "iPad Pro 13\" M4",
        "brand": "Apple",
        "category": "Tablets",
        "description": "The thinnest, most advanced iPad ever. M4 chip with Ultra Retina XDR OLED display, incredible power in impossibly thin design.",
        "imageUrl": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-wifi-spacegray-202405",
        "specs": {
            "chip": "Apple M4",
            "display": "13-inch Ultra Retina XDR OLED",
            "ram": "8GB",
            "storage": "256GB",
            "connectivity": "Wi-Fi 6E, Bluetooth 5.3",
            "weight": "1.28 lbs"
        },
        "retailers": [
            {
                "name": "Apple",
                "url": "https://www.apple.com/shop/buy-ipad/ipad-pro/13-inch-ipad-pro-m4-chip-256gb-storage",
                "price": 1299.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Best Buy",
                "url": "https://www.bestbuy.com/site/apple-13-inch-ipad-pro-m4-chip-256gb-with-wifi/5495362.p",
                "price": 1299.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Amazon",
                "url": "https://www.amazon.com/Apple-iPad-Pro-13-Inch-Landscape/dp/B0D3J7GPRX",
                "price": 1269.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            }
        ],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "id": "ipad-air-13-m2",
        "name": "iPad Air 13\" M2",
        "brand": "Apple",
        "category": "Tablets",
        "description": "Supercharged by M2 chip. Now available in 13-inch for the first time with a stunning Liquid Retina display.",
        "imageUrl": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-select-wifi-blue-202405",
        "specs": {
            "chip": "Apple M2",
            "display": "13-inch Liquid Retina",
            "ram": "8GB",
            "storage": "128GB",
            "connectivity": "Wi-Fi 6E, Bluetooth 5.3",
            "weight": "1.36 lbs"
        },
        "retailers": [
            {
                "name": "Apple",
                "url": "https://www.apple.com/shop/buy-ipad/ipad-air/13-inch-ipad-air-m2-chip-128gb-storage",
                "price": 799.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Best Buy",
                "url": "https://www.bestbuy.com/site/apple-13-inch-ipad-air-m2-chip-128gb-with-wifi/5495370.p",
                "price": 799.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "B&H Photo",
                "url": "https://www.bhphotovideo.com/c/product/1826693-REG/apple_mv273ll_a_13_ipad_air_m2.html",
                "price": 779.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Amazon",
                "url": "https://www.amazon.com/Apple-iPad-Air-13-Inch-Landscape/dp/B0D3J61YNH",
                "price": 769.99,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            }
        ],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "id": "apple-studio-display",
        "name": "Apple Studio Display",
        "brand": "Apple",
        "category": "Displays",
        "description": "27-inch 5K Retina display with 600 nits of brightness, P3 wide color, 12MP Ultra Wide camera with Center Stage, and six-speaker sound system.",
        "imageUrl": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/studio-display-select-standard-202203",
        "specs": {
            "display": "27-inch 5K Retina",
            "brightness": "600 nits",
            "camera": "12MP Ultra Wide with Center Stage",
            "audio": "Six-speaker system with Spatial Audio",
            "ports": "1x Thunderbolt 3, 3x USB-C",
            "weight": "12.5 lbs"
        },
        "retailers": [
            {
                "name": "Apple",
                "url": "https://www.apple.com/shop/buy-mac/apple-studio-display",
                "price": 1599.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "Best Buy",
                "url": "https://www.bestbuy.com/site/apple-studio-display-standard-glass/6457217.p",
                "price": 1599.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            },
            {
                "name": "B&H Photo",
                "url": "https://www.bhphotovideo.com/c/product/1695070-REG/apple_mk0u3ll_a_studio_display_27.html",
                "price": 1549.00,
                "currency": "USD",
                "availability": "in_stock",
                "lastChecked": now
            }
        ],
        "createdAt": now,
        "updatedAt": now
    }
]


def main():
    parser = argparse.ArgumentParser(description="Seed the unified backend with Apple product data")
    parser.add_argument("--dry-run", action="store_true", help="Print JSON without sending to API")
    parser.add_argument("--api-url", default=API_BASE, help=f"API base URL (default: {API_BASE})")
    args = parser.parse_args()

    if args.dry_run:
        print(json.dumps(products, indent=2))
        print(f"\n[OK] {len(products)} products ready (dry run, not sent)")
        return

    try:
        import urllib.request

        url = f"{args.api_url}/products/seed"
        data = json.dumps(products).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        print(f"Sending {len(products)} products to {url}...")
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode())
            print(f"[OK] {result.get('message', 'Done')}")

    except Exception as e:
        print(f"[ERROR] Failed to seed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
