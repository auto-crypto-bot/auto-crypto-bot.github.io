import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useDashboardStats = () => {
    const [balances, setBalances] = useState({ BTC: { free: 0, frozen: 0 }, USDC: { free: 0, frozen: 0 } });

    // Derived State
    const btcPrice = parseFloat(ticker.lastPrice || ticker.price || 0);
    const btcAmount = (balances.BTC?.free || 0) + (balances.BTC?.frozen || 0);
    const usdcAmount = (balances.USDC?.free || 0) + (balances.USDC?.frozen || 0);
    const portfolioValue = (btcAmount * btcPrice) + usdcAmount;
    const [ticker, setTicker] = useState({ price: 0 });
    const [positionsInfo, setPositionsInfo] = useState({ active: 0, max: 40 });
    const [stats, setStats] = useState({ total_pl: 0, runtime_seconds: 0, profit_24h: 0, cycles_24h: 0 });
    const [realtimeStatus, setRealtimeStatus] = useState('CONNECTING');
    const [systemHealth] = useState({ cpu_load: '0%', memory_usage: '0 MB', disk_space: '0 GB Free' });
    const [systemLogs, setSystemLogs] = useState([]);

    useEffect(() => {
        const setupSubscriptions = () => {
            supabase.from('strategy_stats').select('key, value').in('key', ['ticker_BTCUSDC', 'balances', 'bot_configuration']).then(({ data }) => {
                if (data) {
                    let initialTicker = { price: 0, lastPrice: 0 };
                    let initialBalances = { BTC: { free: 0, frozen: 0 }, USDC: { free: 0, frozen: 0 } };

                    data.forEach(row => {
                        if (row.key === 'ticker_BTCUSDC') {
                            try { initialTicker = typeof row.value === 'string' ? JSON.parse(row.value) : row.value; setTicker(initialTicker); } catch { /* ignore */ }
                        } else if (row.key === 'balances') {
                            try { initialBalances = typeof row.value === 'string' ? JSON.parse(row.value) : row.value; setBalances(initialBalances); } catch { /* ignore */ }
                        } else if (row.key === 'bot_configuration') {
                            try {
                                const config = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
                                setPositionsInfo(prev => ({
                                    ...prev,
                                    max: config.max_positions || 40,
                                    quantity: config.quantity || 0
                                }));
                            } catch { /* ignore */ }
                        }
                    });
                }
            });

            const sub = supabase.channel('home-realtime-debug')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'strategy_stats' }, (payload) => {
                    if (!payload.new) return;
                    const { key, value } = payload.new;
                    if (!value) return;

                    try {
                        const parsed = typeof value === 'string' ? JSON.parse(value) : value;

                        if (key === 'ticker_BTCUSDC') {
                            setTicker(parsed);
                        } else if (key === 'balances') {
                            setBalances(parsed);
                        } else if (key === 'bot_configuration') {
                            setPositionsInfo(prev => ({
                                ...prev,
                                max: parsed.max_positions || 40,
                                quantity: parsed.quantity || 0
                            }));
                        }
                    } catch (e) {
                        console.error("RT Parse Error", e);
                    }
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') setRealtimeStatus('Active');
                    if (status === 'CHANNEL_ERROR') setRealtimeStatus('Error');
                    if (status === 'TIMED_OUT') setRealtimeStatus('Timeout');
                    if (status === 'CLOSED') setRealtimeStatus('Disconnected');
                });
            return sub;
        };

        const sub = setupSubscriptions();

        const fetchPositions = async () => {
            const { count, error } = await supabase.from('strategy_positions').select('*', { count: 'exact', head: true }).eq('status', 'TP_PLACED');
            if (!error && count !== null) setPositionsInfo(prev => ({ ...prev, active: count }));
        };

        const fetchStats = async () => {
            const { data: cycles } = await supabase.from('completed_cycles').select('profit, close_time');
            if (cycles) {
                const total_pl = cycles.reduce((acc, c) => acc + (c.profit || 0), 0);
                const startTime = cycles.length > 0 ? Math.min(...cycles.map(c => new Date(c.close_time).getTime() / 1000)) : Date.now() / 1000;
                const runtime = (Date.now() / 1000) - startTime;

                const oneDayAgo = (Date.now() / 1000) - 86400;
                const recent = cycles.filter(c => (new Date(c.close_time).getTime() / 1000) > oneDayAgo);
                const profit_24h = recent.reduce((acc, c) => acc + (c.profit || 0), 0);

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
            .on('postgres_changes', { event: '*', schema: 'public', table: 'strategy_positions' }, () => {
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
            supabase.removeChannel(sub);
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
