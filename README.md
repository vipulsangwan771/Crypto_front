# Crypto Tracker

A full-stack cryptocurrency tracking application built with the MERN stack that fetches and displays real-time cryptocurrency data from CoinGecko API.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **API**: CoinGecko API
- **Scheduling**: node-cron
- **Deployment**: 
  - Frontend: Vercel
  - Backend: Render
  - Database: MongoDB Atlas

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Backend Setup
1. Navigate to the server directory:
```bash
cd server
```
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the server directory:
```bash
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
```
4. Start the backend server:
```bash
npm start
```

### Frontend Setup
1. Navigate to the client directory:
```bash
cd client
```
2. Install dependencies:
```bash
npm install
```
3. Update the API URL in `client/src/components/CryptoTable.js` to point to your backend URL if not using localhost.
4. Start the frontend development server:
```bash
npm start
```

## Cron Job
The application uses `node-cron` to schedule data fetching every hour:
- Located in `server/jobs/cryptoJob.js`
- Schedule: `0 * * * *` (runs every hour)
- Fetches top 10 cryptocurrencies from CoinGecko
- Updates current data in `Crypto` collection
- Stores historical data in `HistoricalCrypto` collection

## Deployment
- **Frontend**: Deployed on Vercel
  - URL: [Add your Vercel URL]
- **Backend**: Deployed on Render
  - API Base URL: [Add your Render URL]
- **Database**: MongoDB Atlas
  - Stores two collections: `Crypto` (current data) and `HistoricalCrypto` (hourly snapshots)
