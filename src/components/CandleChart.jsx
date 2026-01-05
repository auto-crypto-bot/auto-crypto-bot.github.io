import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { supabase } from '../lib/supabase';

const CandleChart = ({ interval = '1m' }) => {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const seriesRef = useRef();

    // 1. Initialize Chart (Run Once)
    useEffect(() => {
        if (!chartContainerRef.current) return;

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

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // 2. Handle Data & Subscriptions updates (On Interval Change)
    useEffect(() => {
        if (!seriesRef.current) return;

        const candlestickSeries = seriesRef.current;
        // Tracks active price lines by order ID to prevent flickering
        const activeLinesMap = new Map();

        // Data Fetching & Subscriptions
        const fetchData = async () => {
            try {
                // Binannce API expects '1h' not '60m'
                const apiInterval = interval === '60m' ? '1h' : interval;

                // 1. Initial History (REST)
                const response = await fetch(`https://data-api.binance.vision/api/v3/klines?symbol=BTCUSDC&interval=${apiInterval}&limit=1000`);
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

                // 2. Initial Markers & Lines (Supabase)
                updateMarkers();
                updatePriceLines();

            } catch (error) {
                console.error("Failed to fetch initial chart data:", error);
            }
        };

        // Helper: Update Markers (Filled Orders)
        const updateMarkers = async () => {
            const { data: trades } = await supabase
                .from('orders')
                .select('created_at, side, quantity, price, order_id')
                .eq('status', 'FILLED')
                .order('created_at', { ascending: false })
                .limit(500);

            if (trades) {
                const getIntervalSeconds = (str) => {
                    if (str.endsWith('m')) return parseInt(str) * 60;
                    if (str.endsWith('h')) return parseInt(str) * 3600;
                    if (str.endsWith('d')) return parseInt(str) * 86400;
                    return 60;
                };
                const intervalSecs = getIntervalSeconds(interval);

                const grouped = {};
                trades.forEach(t => {
                    // Robust side check
                    const isBuy = t.side === 'BUY' || t.side === 1 || t.side === 'buy';

                    const tradeTimeSec = new Date(t.created_at).getTime() / 1000;
                    const snappedTime = Math.floor(tradeTimeSec / intervalSecs) * intervalSecs;

                    if (!grouped[snappedTime]) grouped[snappedTime] = { buys: 0, sells: 0 };

                    if (isBuy) grouped[snappedTime].buys++;
                    else grouped[snappedTime].sells++;
                });

                const markers = [];
                Object.keys(grouped).forEach(timeKey => {
                    const time = parseFloat(timeKey);
                    const { buys, sells } = grouped[timeKey];
                    // Position calculations: B below, S above
                    if (buys > 0) markers.push({
                        time,
                        position: 'belowBar',
                        color: '#00ff88',
                        shape: 'arrowUp', // Changed to arrow for better visibility
                        text: buys > 1 ? `${buys}B` : 'B',
                        size: 2 // Slightly larger
                    });
                    if (sells > 0) markers.push({
                        time,
                        position: 'aboveBar',
                        color: '#ff4d4d',
                        shape: 'arrowDown',
                        text: sells > 1 ? `${sells}S` : 'S',
                        size: 2
                    });
                });
                markers.sort((a, b) => a.time - b.time);
                candlestickSeries.setMarkers(markers);
            }
        };

        // Helper: Update Price Lines (Open Orders)
        const updatePriceLines = async () => {
            const { data: openOrders } = await supabase.from('orders').select('order_id, price, side').eq('status', 'NEW');
            if (openOrders) {
                const currentIds = new Set();
                openOrders.forEach(order => {
                    currentIds.add(order.order_id);
                    const existing = activeLinesMap.get(order.order_id);
                    if (existing) {
                        existing.applyOptions({ price: order.price });
                    } else {
                        const isBuy = order.side === 'BUY';
                        const isMobile = window.innerWidth < 900;
                        const line = candlestickSeries.createPriceLine({
                            price: order.price,
                            color: isBuy ? '#00ff88' : '#ff4d4d',
                            lineWidth: 1,
                            lineStyle: 2,
                            axisLabelVisible: true,
                            title: isMobile ? '' : (isBuy ? 'BUY' : 'SELL'),
                            lineVisible: true,
                        });
                        activeLinesMap.set(order.order_id, line);
                    }
                });
                for (const [id, line] of activeLinesMap) {
                    if (!currentIds.has(id)) {
                        candlestickSeries.removePriceLine(line);
                        activeLinesMap.delete(id);
                    }
                }
            }
        };

        fetchData();

        // --- Real-time: Binance WebSocket (Candles) ---
        let ws = null;
        let wsTimeout = setTimeout(() => {
            const wsInterval = interval === '60m' ? '1h' : interval;
            ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdc@kline_${wsInterval}`);

            ws.onopen = () => {
                // Connection established
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message.k) {
                    const k = message.k;
                    candlestickSeries.update({
                        time: k.t / 1000,
                        open: parseFloat(k.o),
                        high: parseFloat(k.h),
                        low: parseFloat(k.l),
                        close: parseFloat(k.c),
                    });
                }
            };

            ws.onerror = (e) => {
                // Silent error handling for frequent disconnects in dev
            };
        }, 500); // 500ms delay to bypass strict mode double-mount

        return () => {
            clearTimeout(wsTimeout);
            if (activeLinesMap) {
                activeLinesMap.forEach(line => {
                    try { candlestickSeries.removePriceLine(line); } catch (e) { }
                });
            }
            if (ws) {
                ws.onmessage = null;
                ws.close();
            }
            supabase.removeChannel(ordersSub);
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
