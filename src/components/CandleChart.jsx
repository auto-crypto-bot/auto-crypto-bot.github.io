import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

const CandleChart = ({ interval = '1m' }) => {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const seriesRef = useRef();

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // 1. Initialize Chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#8b949e',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00ff88',
            downColor: '#ff4d4d',
            borderVisible: false,
            wickUpColor: '#00ff88',
            wickDownColor: '#ff4d4d',
        });

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        // -------------------------------------------------------------------------
        // FUTURE: BACKEND WEBSOCKET INTEGRATION
        // -------------------------------------------------------------------------
        // Currently, we simulate real-time updates by polling the Proxy API every 1s.
        // To switch to the real Backend WebSocket in the future:
        // 1. Remove the setInterval polling logic below.
        // 2. Initialize a WebSocket connection: const ws = new WebSocket('ws://localhost:8000/ws');
        // 3. On 'message' event, parse the candle data and call:
        //    candlestickSeries.update({ time: ..., open: ..., high: ..., low: ..., close: ... });
        // -------------------------------------------------------------------------

        // 2. Poll Data (Proxy)
        // 2. Poll Data (Proxy)
        const fetchHistory = async () => {
            try {
                // Fetch History
                const response = await fetch(`/api/v3/klines?symbol=BTCUSDC&interval=${interval}&limit=1000`);
                const data = await response.json();

                const candleData = data.map(d => ({
                    time: d[0] / 1000,
                    open: parseFloat(d[1]),
                    high: parseFloat(d[2]),
                    low: parseFloat(d[3]),
                    close: parseFloat(d[4]),
                }));

                candlestickSeries.setData(candleData);
            } catch (error) {
                console.error("Failed to fetch chart data:", error);
            }
        };

        const updateLatest = async () => {
            try {
                // Fetch Latest Candle
                const response = await fetch(`/api/v3/klines?symbol=BTCUSDC&interval=${interval}&limit=1`);
                const data = await response.json();
                if (data && data.length > 0) {
                    const d = data[data.length - 1];
                    candlestickSeries.update({
                        time: d[0] / 1000,
                        open: parseFloat(d[1]),
                        high: parseFloat(d[2]),
                        low: parseFloat(d[3]),
                        close: parseFloat(d[4]),
                    });
                }
            } catch (error) {
                console.error("Failed to update chart:", error);
            }
        };

        fetchHistory();
        // 1 second interval
        const intervalId = setInterval(updateLatest, 1000);

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [interval]);

    return (
        <div
            ref={chartContainerRef}
            style={{ width: '100%', height: '100%', position: 'relative' }}
        />
    );
};

export default CandleChart;
