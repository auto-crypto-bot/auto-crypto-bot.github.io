import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { supabase } from '../lib/supabase';

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

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#00ff88',
            downColor: '#ff4d4d',
            borderVisible: false,
            wickUpColor: '#00ff88',
            wickDownColor: '#ff4d4d',
        });

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        // Tracks active price lines by order ID to prevent flickering
        const activeLinesMap = new Map();

        const fetchData = async () => {
            try {
                // --- 1. History & Candles (Public Data API) ---
                // Using data-api.binance.vision as it supports CORS better than api.binance.com
                const response = await fetch(`https://data-api.binance.vision/api/v3/klines?symbol=BTCUSDC&interval=${interval}&limit=1000`);
                const data = await response.json();

                if (Array.isArray(data)) {
                    const candleData = data.map(d => ({
                        time: d[0] / 1000,
                        open: parseFloat(d[1]),
                        high: parseFloat(d[2]),
                        low: parseFloat(d[3]),
                        close: parseFloat(d[4]),
                    }));
                    candlestickSeries.setData(candleData);
                }

                // --- 2. Markers (Trades from Supabase) ---
                const { data: trades } = await supabase
                    .from('orders')
                    .select('created_at, side')
                    .eq('status', 'FILLED')
                    .order('created_at', { ascending: false })
                    .limit(400);

                if (trades) {
                    // Helper to parse interval to seconds
                    const getIntervalSeconds = (str) => {
                        if (str.endsWith('m')) return parseInt(str) * 60;
                        if (str.endsWith('h')) return parseInt(str) * 3600;
                        if (str.endsWith('d')) return parseInt(str) * 86400;
                        return 60; // default 1m
                    };
                    const intervalSecs = getIntervalSeconds(interval);

                    // Group trades by Snapped Time
                    const grouped = {};
                    trades.forEach(t => {
                        const tradeTimeSec = new Date(t.created_at).getTime() / 1000;
                        const snappedTime = Math.floor(tradeTimeSec / intervalSecs) * intervalSecs;

                        if (!grouped[snappedTime]) grouped[snappedTime] = { buys: 0, sells: 0 };
                        if (t.side === 'BUY') grouped[snappedTime].buys++;
                        else grouped[snappedTime].sells++;
                    });

                    const markers = [];
                    Object.keys(grouped).forEach(timeKey => {
                        const time = parseFloat(timeKey);
                        const { buys, sells } = grouped[timeKey];
                        if (buys > 0) markers.push({ time, position: 'belowBar', color: '#00ff88', shape: 'circle', text: buys > 1 ? `${buys}B` : 'B', size: 1 });
                        if (sells > 0) markers.push({ time, position: 'aboveBar', color: '#ff4d4d', shape: 'circle', text: sells > 1 ? `${sells}S` : 'S', size: 1 });
                    });
                    markers.sort((a, b) => a.time - b.time);
                    candlestickSeries.setMarkers(markers);
                }

                // --- 3. Price Lines (Open Orders from Supabase) ---
                try {
                    const { data: openOrders } = await supabase
                        .from('orders')
                        .select('order_id, price, side')
                        .eq('status', 'NEW');

                    if (openOrders) {
                        const currentIds = new Set();

                        // Add / Update
                        openOrders.forEach(order => {
                            currentIds.add(order.order_id);
                            const existing = activeLinesMap.get(order.order_id);

                            if (existing) {
                                // Update if prices change
                                existing.applyOptions({ price: order.price });
                            } else {
                                const isBuy = order.side === 'BUY';
                                const isMobile = window.innerWidth < 900;
                                const line = candlestickSeries.createPriceLine({
                                    price: order.price,
                                    color: isBuy ? '#00ff88' : '#ff4d4d',
                                    lineWidth: 1,
                                    lineStyle: 2, // Dashed
                                    axisLabelVisible: true,
                                    title: isMobile ? '' : (isBuy ? 'BUY' : 'SELL'),
                                    lineVisible: true,
                                });
                                activeLinesMap.set(order.order_id, line);
                            }
                        });

                        // Remove old
                        for (const [id, line] of activeLinesMap) {
                            if (!currentIds.has(id)) {
                                candlestickSeries.removePriceLine(line);
                                activeLinesMap.delete(id);
                            }
                        }
                    }

                } catch (e) {
                    console.error("Failed to load price lines", e);
                }

            } catch (error) {
                console.error("Failed to fetch chart data:", error);
            }
        };

        const updateLatest = async () => {
            await fetchData();
        };

        fetchData();
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
