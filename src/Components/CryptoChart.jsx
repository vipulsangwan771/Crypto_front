import React, { memo, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const CryptoChart = () => {
  const { coinId } = useParams();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('3d');
  const chartRef = useRef(null);
  const canvasRef = useRef(null);
  const fetchTimeoutRef = useRef(null);
  const [chartLibsLoaded, setChartLibsLoaded] = useState(false);
  const chartConstructorRef = useRef(null); // Store Chart constructor

  // Dynamically load chart.js libraries
  useEffect(() => {
    let isMounted = true;
    const loadChartLibs = async () => {
      try {
        const { Chart, registerables } = await import('chart.js');
        const { CandlestickController, CandlestickElement } = await import('chartjs-chart-financial');
        await import('chartjs-adapter-date-fns');
        if (isMounted) {
          Chart.register(...registerables, CandlestickController, CandlestickElement);
          chartConstructorRef.current = Chart; // Store Chart constructor
          setChartLibsLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load chart libraries:', err);
        if (isMounted) {
          setError('Failed to load chart libraries.');
          setLoading(false);
        }
      }
    };
    loadChartLibs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch chart data
  const fetchChartData = async () => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const url = `${baseUrl}/api/crypto/chart/${coinId}?range=${range}`;
    try {
      const response = await axios.get(url, {
        headers: {
          'x-api-key': process.env.REACT_APP_API_KEY || 'your_secure_api_key_123',
        },
      });

      const rawData = response.data.datasets[0].data;

      if (!rawData || rawData.length < 2) {
        throw new Error('Insufficient data to render chart.');
      }

      const ohlcData = rawData.map((d) => ({
        x: new Date(d.t).getTime(),
        o: d.o,
        h: d.h,
        l: d.l,
        c: d.c,
      }));

      const now = Date.now();
      const cutoff = range === '1d' ? now - 1 * 24 * 60 * 60 * 1000 : now - 3 * 24 * 60 * 60 * 1000;

      setChartData({
        datasets: [
          {
            label: `${coinId.toUpperCase()} Candlestick`,
            data: ohlcData.filter((d) => d.x >= cutoff),
            borderColor: '#000',
            borderWidth: 1,
            upColor: '#22c55e',
            downColor: '#ef4444',
            color: 'rgba(0, 0, 0, 0.8)',
          },
        ],
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to load chart data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchChartData();
    }, 500);

    return () => clearTimeout(fetchTimeoutRef.current);
  }, [coinId, range]);

  // Initialize or update chart
  useEffect(() => {
    if (!chartLibsLoaded || !chartData || !canvasRef.current || !chartConstructorRef.current) {
      return;
    }

    let chartInstance = null;
    try {
      if (chartRef.current) {
        chartRef.current.data = chartData;
        chartRef.current.options.scales.x.time.unit = range === '1d' ? 'hour' : 'day';
        chartRef.current.update();
      } else {
        chartInstance = new chartConstructorRef.current(canvasRef.current, {
          type: 'candlestick',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const d = ctx.raw;
                    return [
                      `Open: $${d.o.toFixed(2)}`,
                      `High: $${d.h.toFixed(2)}`,
                      `Low: $${d.l.toFixed(2)}`,
                      `Close: $${d.c.toFixed(2)}`,
                    ];
                  },
                },
              },
            },
            scales: {
              x: {
                type: 'time',
                time: { unit: range === '1d' ? 'hour' : 'day' },
                ticks: { color: '#4b5563' },
              },
              y: {
                beginAtZero: false,
                ticks: {
                  color: '#4b5563',
                  callback: (val) => `$${val.toFixed(2)}`,
                },
              },
            },
          },
        });
        chartRef.current = chartInstance;
      }
    } catch (err) {
      console.error('Error initializing chart:', err);
      setError('Failed to render chart.');
      setLoading(false);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartData, range, chartLibsLoaded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-6 px-4">
      <div className="max-w-8xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            {coinId} Trading Chart
          </h2>
          <div className="flex gap-2 flex-wrap">
            {['1d', '3d'].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRange(r);
                  setLoading(true);
                }}
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  range === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
            <Link
              to="/"
              className="px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-xl p-4 min-h-[350px]">
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
            </div>
          )}
          {error && (
            <div className="text-center text-red-600 font-medium">
              <p>{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchChartData();
                }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}
          {!loading && !error && chartData && chartLibsLoaded && (
            <div className="relative h-[400px] w-full">
              <canvas ref={canvasRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(CryptoChart);
