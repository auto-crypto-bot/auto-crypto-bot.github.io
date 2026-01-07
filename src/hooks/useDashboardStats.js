import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useDashboardStats = () => {
    const [balances, setBalances] = useState({ BTC: { free: 0, frozen: 0 }, USDC: { free: 0, frozen: 0 } });

    const [ticker, setTicker] = useState({ price: 0 });
    const [positionsInfo, setPositionsInfo] = useState({ active: 0, max: 40 });
    const [stats, setStats] = useState({ total_pl: 0, runtime_seconds: 0, profit_24h: 0, cycles_24h: 0 });

    // Derived State
    const btcPrice = parseFloat(ticker.lastPrice || ticker.price || 0);
    const btcAmount = (balances.BTC?.free || 0) + (balances.BTC?.locked || 0) + (balances.BTC?.frozen || 0);
    const usdcAmount = (balances.USDC?.free || 0) + (balances.USDC?.locked || 0) + (balances.USDC?.frozen || 0);
    const portfolioValue = (btcAmount * btcPrice) + usdcAmount;

    // Debug: Check if calculation matches expectation
    // console.log("Portfolio Calc:", { btcAmount, btcPrice, usdcAmount, total: portfolioValue });

    const [realtimeStatus, setRealtimeStatus] = useState('CONNECTING');
    const [systemHealth] = useState({ cpu_load: '0%', memory_usage: '0 MB', disk_space: '0 GB Free' });
    const [systemLogs, setSystemLogs] = useState([]);

    useEffect(() => {
        const setupSubscriptions = () => {
            // Fetch Initial State
            // Fetch Initial State
            // Ticker: Use Binance WS
            // Balances: We don't have live balances in new schema yet. Defaulting to 0.
            // Ideally we fetch from balance_snapshots
            supabase.from('balance_snapshots').select('asset, total_balance').order('timestamp', { ascending: false }).limit(2).then(({ data }) => {
                if (data) {
                    const newBal = { BTC: { free: 0, frozen: 0 }, USDC: { free: 0, frozen: 0 } };
                    data.forEach(b => {
                        if (b.asset === 'BTC') newBal.BTC.free = parseFloat(b.total_balance);
                        if (b.asset === 'USDC') newBal.USDC.free = parseFloat(b.total_balance);
                    });
                    setBalances(newBal);
                }
            });

            // Re-setup Binance WS for Dashboard Ticker (Lightweight)
            const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdc@ticker');
            ws.onmessage = (e) => {
                try {
                    const d = JSON.parse(e.data);
                    setTicker({ price: d.c, lastPrice: d.c });
                } catch { /* ignore parse error */ }
            };

            // Fetch Max Positions from Config
            supabase.from('bot_config').select('config_json').eq('symbol', 'BTCUSDC').single().then(({ data, error }) => {
                if (error) console.error("Error fetching config for dashboard:", error);
                if (data?.config_json) {
                    console.log("Initial Config Data:", data.config_json);
                    setPositionsInfo(prev => ({
                        ...prev,
                        max: data.config_json.max_positions || 40,
                        quantity: data.config_json.quantity || 0
                    }));
                }
            });

            // Listen for Bot Config Updates
            const sub = supabase.channel('home-realtime-config')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'bot_config' }, (payload) => {
                    if (payload.new && payload.new.config_json) {
                        const c = payload.new.config_json;
                        setPositionsInfo(prev => ({ ...prev, max: c.max_positions || 40, quantity: c.quantity || 0 }));
                    }
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') setRealtimeStatus('Active');
                    else if (status === 'CLOSED') setRealtimeStatus('Disconnected');
                });

            return {
                unsubscribe: () => {
                    ws.close();
                    supabase.removeChannel(sub);
                }
            };
        };

        const sub = setupSubscriptions();

        const fetchPositions = async () => {
            const { count, error } = await supabase.from('active_positions').select('*', { count: 'exact', head: true }).eq('status', 'OPEN');
            if (!error && count !== null) setPositionsInfo(prev => ({ ...prev, active: count }));
        };

        const fetchStats = async () => {
            const { data: cycles } = await supabase.from('completed_cycles').select('net_profit, closed_at');
            if (cycles) {
                const total_pl = cycles.reduce((acc, c) => acc + (c.net_profit || 0), 0);
                const startTime = cycles.length > 0 ? Math.min(...cycles.map(c => new Date(c.closed_at).getTime() / 1000)) : Date.now() / 1000;
                const runtime = (Date.now() / 1000) - startTime;

                const oneDayAgo = (Date.now() / 1000) - 86400;
                const recent = cycles.filter(c => (new Date(c.closed_at).getTime() / 1000) > oneDayAgo);
                const profit_24h = recent.reduce((acc, c) => acc + (c.net_profit || 0), 0);

                setStats({
                    total_pl,
                    runtime_seconds: runtime,
                    profit_24h,
                    cycles_24h: recent.length
                });
            }
        };

        const fetchLogs = async () => {
            const { data: logs } = await supabase.from('logs').select('message, timestamp').order('timestamp', { ascending: false }).limit(20);
            if (logs) {
                setSystemLogs(logs.map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.message}`));
            }
        };

        fetchPositions();
        fetchStats();
        fetchLogs();

        const positionsSub = supabase.channel('positions-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'active_positions' }, () => {
                fetchPositions();
            })
            .subscribe();

        const cyclesSub = supabase.channel('cycles-updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'completed_cycles' }, () => {
                fetchStats();
            })
            .subscribe();

        const logsSub = supabase.channel('logs-updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logs' }, (payload) => {
                const newLog = payload.new;
                if (newLog) {
                    const logStr = `[${new Date(newLog.timestamp).toLocaleTimeString()}] ${newLog.message}`;
                    setSystemLogs(prev => [logStr, ...prev].slice(0, 20));
                }
            })
            .subscribe();

        return () => {
            if (sub && sub.unsubscribe) sub.unsubscribe();
            else supabase.removeChannel(sub); // Fallback for promise/obj mixup
            supabase.removeChannel(positionsSub);
            supabase.removeChannel(cyclesSub);
            supabase.removeChannel(logsSub);
        };
    }, []);



    return {
        portfolioValue,
        balances,
        ticker,
        positionsInfo,
        stats,
        realtimeStatus,
        systemHealth,
        systemLogs
    };
};
