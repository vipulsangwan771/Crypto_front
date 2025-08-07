import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables, CandlestickController, CandlestickElement);

const CryptoChart = () => {
    const { coinId } = useParams();
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [range, setRange] = useState('7d'); 
    const chartRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const fetchChartData = async () => {
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const url = `${baseUrl}/api/crypto/chart/${coinId}`;
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

                // ✅ Filter only for 1d or 7d
                const now = Date.now();
                const cutoff = range === '1d'
                    ? now - 1 * 24 * 60 * 60 * 1000
                    : now - 7 * 24 * 60 * 60 * 1000;

                const filtered = ohlcData.filter((d) => d.x >= cutoff);

                setChartData({
                    datasets: [
                        {
                            label: `${coinId.toUpperCase()} Candlestick`,
                            data: filtered,
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
                console.error(err);
                setError('Failed to load chart data.');
                setLoading(false);
            }
        };

        fetchChartData();
    }, [coinId, range]);

    useEffect(() => {
        if (chartData && canvasRef.current) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            chartRef.current = new Chart(canvasRef.current, {
                type: 'candlestick',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const d = ctx.raw;
                                    return [
                                        `Open: $${d.o}`,
                                        `High: $${d.h}`,
                                        `Low: $${d.l}`,
                                        `Close: $${d.c}`,
                                    ];
                                },
                            },
                        },
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: range === '1d' ? 'hour' : 'day',
                            },
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
        }

        return () => {
            if (chartRef.current) chartRef.current.destroy();
        };
    }, [chartData, range]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-6 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">
                        {coinId} Trading Chart
                    </h2>
                    <div className="flex gap-2 flex-wrap">
                        {/* ✅ Only 1d and 7d buttons */}
                        {['1d', '7d'].map((r) => (
                            <button
                                key={r}
                                onClick={() => {
                                    setRange(r);
                                    setLoading(true);
                                }}
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${range === r
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
                        <p className="text-center text-red-600 font-medium">{error}</p>
                    )}
                    {!loading && !error && chartData && (
                        <div className="relative h-[400px] w-full">
                            <canvas ref={canvasRef}></canvas>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CryptoChart;
