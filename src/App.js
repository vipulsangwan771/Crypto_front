
import React, { Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './Components/Header';
import CryptoChart from './Components/CryptoChart';

function App() {
  
const CryptoTable = React.lazy(() => import('./Components/CryptoTable'));
  return (
    <>
      <Router>
        <div className="min-h-screen bg-gray-100">
       <nav className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-white text-xl font-bold">
            Crypto Dashboard
          </Link>
          <div>
            <Link to="/" className="text-white px-4 py-2 hover:bg-blue-700 rounded">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>
          <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
            <Routes>
              <Route path="/" element={<CryptoTable />} />
              
        <Route path="/chart/:coinId" element={<CryptoChart />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </>
  );
}

export default App;
