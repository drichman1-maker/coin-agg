# Node.js Installation and Application Setup Guide

## Step 1: Install Node.js

1. **Download Node.js**:
   - Open your web browser
   - Go to: https://nodejs.org/
   - Click the **LTS (Long Term Support)** version button (recommended)
   - The download should start automatically for Windows

2. **Run the Installer**:
   - Locate the downloaded file (usually in your Downloads folder)
   - Double-click `node-v20.x.x-x64.msi` to run the installer
   - Follow the installation wizard:
     - Click "Next"
     - Accept the license agreement
     - Keep the default installation path
     - **IMPORTANT**: Make sure "Add to PATH" is checked
     - Click "Install"
     - Wait for installation to complete
     - Click "Finish"

3. **Verify Installation**:
   - Open a **NEW** PowerShell or Command Prompt window
   - Run: `node --version`
   - You should see something like `v20.18.1`
   - Run: `npm --version`
   - You should see something like `10.8.2`

## Step 2: Install Application Dependencies

Open PowerShell or Command Prompt and run:

```powershell
cd "c:\Users\dr\coin agg"
npm install
```

This will install the root dependencies. Then install backend and frontend dependencies:

```powershell
cd backend
npm install
cd ../frontend
npm install
cd ..
```

## Step 3: Start the Application

### Option A: Start Both Servers at Once (Recommended)

From the root directory `c:\Users\dr\coin agg`:

```powershell
npm run dev
```

This will start both the backend and frontend servers simultaneously.

### Option B: Start Servers Separately

**Terminal 1 - Backend:**
```powershell
cd "c:\Users\dr\coin agg\backend"
npm run dev
```

Wait for the message: `🚀 Server running on http://localhost:3001`

**Terminal 2 - Frontend:**
```powershell
cd "c:\Users\dr\coin agg\frontend"
npm run dev
```

Wait for the message: `Ready on http://localhost:3000`

## Step 4: Access the Application

1. Open your web browser
2. Go to: **http://localhost:3000**
3. You should see the Coin Aggregator homepage!

## What Happens on First Run

When you start the backend for the first time:

1. **Database Creation**: SQLite database will be created at `backend/data/coins.db`
2. **Initial Scraping**: After 5 seconds, the app will start scraping coins from APMEX and JM Bullion
3. **Data Population**: This may take 5-10 minutes depending on the number of coins found
4. **Automatic Updates**: Every 6 hours, the app will automatically refresh the coin data

## Troubleshooting

### "npm is not recognized"
- Make sure you opened a **NEW** terminal window after installing Node.js
- Restart your computer if the issue persists

### Port Already in Use
If you see "Port 3000 is already in use" or "Port 3001 is already in use":
- Close any other applications using those ports
- Or change the port in the `.env` files

### No Coins Showing
- Wait 5-10 minutes for the initial scraping to complete
- Check the backend terminal for scraping progress logs
- The backend logs will show: "Starting APMEX scrape..." and "JM Bullion scrape..."

### Backend Errors
- Make sure the `.env` file exists in the `backend` folder
- Check that all dependencies installed correctly

## Quick Commands Reference

```powershell
# Install everything
npm run install:all

# Start both servers
npm run dev

# Start backend only
cd backend && npm run dev

# Start frontend only
cd frontend && npm run dev

# Check if servers are running
# Backend: http://localhost:3001/api/health
# Frontend: http://localhost:3000
```

## Next Steps After Installation

Once the application is running:

1. **Browse Coins**: Explore the coin listings on the homepage
2. **Search**: Try searching for specific coins (e.g., "Eagle", "Morgan", "Buffalo")
3. **Filter**: Use the filter panel to narrow down by price, year, type, etc.
4. **View Details**: Click on any coin card to see full details
5. **Visit Source**: Click "View on [Source]" to go to the dealer's website

Enjoy your coin aggregator! 🪙
