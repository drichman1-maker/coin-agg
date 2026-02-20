import { Router, Request, Response } from 'express';
import { Product, ProductFilter } from '../types/product';

const router = Router();

// In-memory product store (seeded from seed_data.py or loaded from unified API)
let products: Product[] = [];

// Helper: get lowest price across retailers
function getLowestPrice(product: Product): number {
    if (product.retailers.length === 0) return 0;
    return Math.min(...product.retailers.map(r => r.price));
}

// GET /api/products - List products with filters and pagination
router.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 24;

        const filters: ProductFilter = {
            search: req.query.search as string,
            category: req.query.category as string,
            brand: req.query.brand as string,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        };

        let filtered = [...products];

        if (filters.search) {
            const q = filters.search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q)
            );
        }

        if (filters.category) {
            filtered = filtered.filter(p => p.category === filters.category);
        }

        if (filters.brand) {
            filtered = filtered.filter(p => p.brand === filters.brand);
        }

        if (filters.minPrice !== undefined) {
            filtered = filtered.filter(p => getLowestPrice(p) >= filters.minPrice!);
        }

        if (filters.maxPrice !== undefined) {
            filtered = filtered.filter(p => getLowestPrice(p) <= filters.maxPrice!);
        }

        const total = filtered.length;
        const offset = (page - 1) * limit;
        const paginated = filtered.slice(offset, offset + limit);

        res.json({
            data: paginated,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/:id - Get single product with retailer pricing
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const product = products.find(p => p.id === req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// GET /api/products/:id/retailers - Get all retailer links for a product
router.get('/:id/retailers', async (req: Request, res: Response) => {
    try {
        const product = products.find(p => p.id === req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product.retailers);
    } catch (error) {
        console.error('Error fetching retailers:', error);
        res.status(500).json({ error: 'Failed to fetch retailers' });
    }
});

// POST /api/products/seed - Accept seed data (used by seed_data.py)
router.post('/seed', async (req: Request, res: Response) => {
    try {
        const incoming: Product[] = req.body;

        if (!Array.isArray(incoming)) {
            return res.status(400).json({ error: 'Expected an array of products' });
        }

        products = incoming;
        console.log(`Seeded ${products.length} products`);

        res.json({ message: `Seeded ${products.length} products`, count: products.length });
    } catch (error) {
        console.error('Error seeding products:', error);
        res.status(500).json({ error: 'Failed to seed products' });
    }
});

// GET /api/products/categories/list - Get all available categories
router.get('/categories/list', async (_req: Request, res: Response) => {
    try {
        const categories = [...new Set(products.map(p => p.category))];
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export { products };
export default router;
