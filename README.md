# Collectible Coin Aggregator

A web application that aggregates collectible coin listings from reputable sources across the internet, providing collectors with a centralized platform to discover and compare coins for sale.

## Quick Start

> **⚠️ Node.js Required**: You must have Node.js 18+ installed. If you don't have it:
> 1. Download from https://nodejs.org/ (get the LTS version)
> 2. Run the installer
> 3. Restart your terminal
> 
> **📖 Detailed Setup**: See [SETUP_GUIDE.md](SETUP_GUIDE.md) for step-by-step instructions

```bash
# Install all dependencies
npm run install:all

# Start both backend and frontend
npm run dev

# Open browser to http://localhost:3000
```

## Features

- 🪙 **Multi-Source Aggregation** - Pulls listings from APMEX, JM Bullion, and other reputable dealers
- 🔍 **Advanced Search** - Search by coin name, year, type, and more
- 🎯 **Smart Filtering** - Filter by price range, grade, certification, and source
- 📱 **Responsive Design** - Beautiful UI that works on desktop, tablet, and mobile
- ⚡ **Real-time Updates** - Automated data refresh to keep listings current
- 🎨 **Modern UI** - Glassmorphic design with smooth animations

## Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **SQLite** - Lightweight database for coin listings
- **Cheerio** - Web scraping for data collection
- **Axios** - HTTP client for API requests
- **node-cron** - Scheduled data updates

### Frontend
- **Next.js 14** (App Router)
- **React** + **TypeScript**
- **Vanilla CSS** - Custom design system with CSS variables

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd coin-agg
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:3001`
- Frontend application on `http://localhost:3000`

## Project Structure

```
coin-agg/
├── backend/              # Express API server
│   ├── src/
│   │   ├── database/    # Database schema and operations
│   │   ├── scrapers/    # Web scrapers for each source
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API routes
│   │   ├── types/       # TypeScript types
│   │   └── server.ts    # Main server file
│   └── package.json
├── frontend/            # Next.js application
│   ├── src/
│   │   ├── app/        # Next.js app router pages
│   │   ├── components/ # React components
│   │   ├── lib/        # Utilities and API client
│   │   └── styles/     # Global styles
│   └── package.json
└── package.json         # Root workspace config
```

## API Endpoints

- `GET /api/coins` - List coins with pagination and filters
- `GET /api/coins/:id` - Get single coin details
- `GET /api/sources` - List available data sources
- `POST /api/refresh` - Trigger manual data refresh

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

## License

MIT
