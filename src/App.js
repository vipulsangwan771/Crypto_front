import React, { Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import CryptoChart from './Components/CryptoChart';
import ErrorBoundary from './Components/ErrorBoundary';

function App() {
  const CryptoTable = React.lazy(() => import('./Components/CryptoTable'));
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<CryptoTable />} />
              <Route path="/chart/:coinId" element={<CryptoChart />} />
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;