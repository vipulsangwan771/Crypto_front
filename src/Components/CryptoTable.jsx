import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { Link } from 'react-router-dom';
import { SearchIcon } from '@heroicons/react/solid';

// Fallback dummy data
const fallbackData = [
  {
    coinId: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    currentPrice: 50000,
    marketCap: 900000000000,
    priceChange24h: 1.23,
    lastUpdated: new Date(),
  },
  {
    coinId: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    currentPrice: 3500,
    marketCap: 450000000000,
    priceChange24h: -0.45,
    lastUpdated: new Date(),
  },
  {
    coinId: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    currentPrice: 145,
    marketCap: 65000000000,
    priceChange24h: 2.78,
    lastUpdated: new Date(),
  },
];

// In-memory cache
const cache = {
  data: {},
  get: (key) => cache.data[key],
  set: (key, data) => {
    cache.data[key] = {
      data,
      timestamp: Date.now(),
    };
  },
  isFresh: (key) => {
    const cached = cache.get(key);
    return cached && Date.now() - cached.timestamp < 30 * 60 * 1000;
  },
};

const CryptoTable = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('marketCap');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  const fetchCryptos = useCallback(
    debounce(async (searchQuery) => {
      const cacheKey = `top10_${searchQuery}`;

      if (cache.isFresh(cacheKey)) {
        const cached = cache.get(cacheKey).data;
        setCryptos(cached);
        setIsFallback(cached === fallbackData);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/crypto`,
          {
            params: { limit: 10, search: searchQuery },
            headers: {
              'x-api-key': process.env.REACT_APP_API_KEY || 'your_secure_api_key_123',
            },
            timeout: 10000,
          }
        );

        cache.set(cacheKey, response.data.data);
        setCryptos(response.data.data);
        setIsFallback(false);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cryptos:', err);
        cache.set(cacheKey, fallbackData);
        setCryptos(fallbackData);
        setIsFallback(true);
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (isInitialLoad || !cache.isFresh(`top10_${search}`)) {
      fetchCryptos(search);
      setIsInitialLoad(false);
    } else {
      const cached = cache.get(`top10_${search}`)?.data || [];
      setCryptos(cached);
      setIsFallback(cached === fallbackData);
      setLoading(false);
    }

    const interval = setInterval(() => {
      delete cache.data[`top10_${search}`];
      fetchCryptos(search);
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchCryptos, search, isInitialLoad]);

  const handleSort = useCallback((field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }, [sortField, sortOrder]);

  const sortedCryptos = useMemo(() => {
    return [...cryptos].sort((a, b) => {
      const aValue = a[sortField] ?? 0;
      const bValue = b[sortField] ?? 0;
      if (sortOrder === 'asc') {
        return typeof aValue === 'string' ? aValue.localeCompare(bValue) : aValue - bValue;
      }
      return typeof bValue === 'string' ? bValue.localeCompare(aValue) : bValue - aValue;
    });
  }, [cryptos, sortField, sortOrder]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setIsInitialLoad(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-6 px-4">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Top 10 Cryptocurrencies</h1>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by name or symbol..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
            />
            <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {isFallback && !loading && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-4 border border-yellow-300">
            ⚠️ Live API not responding. Showing fallback data.
          </div>
        )}

        {loading ? (
          <div className="bg-white shadow-2xl rounded-xl overflow-auto">
            <table className="min-w-[768px] w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  {[
                    ['name', 'Name'],
                    ['symbol', 'Symbol'],
                    ['currentPrice', 'Price (USD)'],
                    ['marketCap', 'Market Cap'],
                    ['priceChange24h', '24h Change'],
                    ['lastUpdated', 'Last Updated'],
                  ].map(([field, label]) => (
                    <th
                      key={field}
                      onClick={() => handleSort(field)}
                      className={`py-3 px-4 text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition text-${field === 'name' || field === 'symbol' ? 'left' : 'right'}`}
                    >
                      {label}
                      {sortField === field ? ` ${sortOrder === 'asc' ? '↑' : '↓'}` : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(10)].map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="skeleton h-4 w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white shadow-2xl rounded-xl overflow-auto">
            <table className="min-w-[768px] w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  {[
                    ['name', 'Name'],
                    ['symbol', 'Symbol'],
                    ['currentPrice', 'Price (USD)'],
                    ['marketCap', 'Market Cap'],
                    ['priceChange24h', '24h Change'],
                    ['lastUpdated', 'Last Updated'],
                  ].map(([field, label]) => (
                    <th
                      key={field}
                      onClick={() => handleSort(field)}
                      className={`py-3 px-4 text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition text-${field === 'name' || field === 'symbol' ? 'left' : 'right'}`}
                    >
                      {label}
                      {sortField === field ? ` ${sortOrder === 'asc' ? '↑' : '↓'}` : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedCryptos.map((crypto) => (
                  <tr key={crypto.coinId} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      <Link to={`/chart/${crypto.coinId}`} className="text-blue-600 hover:underline">
                        {crypto.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                      {crypto.symbol.toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-600 whitespace-nowrap">
                      ${crypto.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-600 whitespace-nowrap">
                      ${crypto.marketCap.toLocaleString()}
                    </td>
                    <td
                      className="py-3 px-4 text-sm text-right font-medium whitespace-nowrap"
                      style={{ color: crypto.priceChange24h >= 0 ? '#22c55e' : '#ef4444' }}
                    >
                      {crypto.priceChange24h?.toFixed(2) ?? 'N/A'}%
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-600 whitespace-nowrap">
                      {new Date(crypto.lastUpdated).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(CryptoTable);
