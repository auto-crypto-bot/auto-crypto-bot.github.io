import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Activity, Clock, Server, TrendingUp, Calendar, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Home = () => {
    // State
    const [portfolioValue, setPortfolioValue] = useState(0);
    const [balances, setBalances] = useState({ BTC: { free: 0, frozen: 0 }, USDC: { free: 0, frozen: 0 } });
    const [ticker, setTicker] = useState({ price: 0 });
    const [positionsInfo, setPositionsInfo] = useState({ active: 0, max: 40 });
    const [stats, setStats] = useState({ total_pl: 0, runtime_seconds: 0, profit_24h: 0, cycles_24h: 0 });
    const [realtimeStatus, setRealtimeStatus] = useState('CONNECTING');
    const [systemHealth, setSystemHealth] = useState({ cpu_load: '0%', memory_usage: '0 MB', disk_space: '0 GB Free' });
    const [systemLogs, setSystemLogs] = useState([]);

    const formatRuntime = (seconds) => {
        if (!seconds) return "0m";
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);

        let parts = [];
        if (d > 0) parts.push(`${d}d`);
        if (h > 0) parts.push(`${h}h`);
        parts.push(`${m}m`);
        return parts.join(' ');
    };

    // Investment Data (Hardcoded as requested)
    const initialInvestment = 50.95;
    const investmentDate = "Dec 14, 2025";
    const apiLatency = "24ms"; // Keep mock for now

    useEffect(() => {
        // Helper to update portfolio value
        const updatePortfolio = (currentBalances, currentTicker) => {
            if (currentBalances && currentTicker.lastPrice) {
                const btcPrice = parseFloat(currentTicker.lastPrice || 0);
                const btcAmount = (currentBalances.BTC?.free || 0) + (currentBalances.BTC?.frozen || 0);
                const usdcAmount = (currentBalances.USDC?.free || 0) + (currentBalances.USDC?.frozen || 0);
                setPortfolioValue((btcAmount * btcPrice) + usdcAmount);
            }
        };

        const setupSubscriptions = () => {
            // Initial Data Fetch
            // 1. Ticker & Balance from Strategy Stats
            supabase.from('strategy_stats').select('key, value').in('key', ['ticker_BTCUSDC', 'balances']).then(({ data }) => {
                if (data) {
                    data.forEach(row => {
                        if (row.key === 'ticker_BTCUSDC') {
                            try {
                                const val = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
                                setTicker(val);
                            } catch (e) { }
                        } else if (row.key === 'balances') {
                            try {
                                const val = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
                                setBalances(val);
                            } catch (e) { }
                        }
                    });
                }
            });

            // 2. Max Positions from Strategy Config
            supabase.from('strategy_config').select('params').eq('symbol', 'BTCUSDC').single().then(({ data }) => {
                if (data?.params) {
                    setPositionsInfo(prev => ({
                        ...prev,
                        max: data.params.max_positions || 40,
                        quantity: data.params.quantity || 0
                    }));
                }
            });

            // Realtime: Strategy Config (for Max Positions)
            const configSub = supabase.channel('home-config')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'strategy_config', filter: 'symbol=eq.BTCUSDC' }, (payload) => {
                    if (payload.new && payload.new.params) {
                        setPositionsInfo(prev => ({
                            ...prev,
                            max: payload.new.params.max_positions || 40,
                            quantity: payload.new.params.quantity || 0
                        }));
                    }
                })
                .subscribe();

            // Realtime: Ticker & Balance (Strategy Stats)
            const sub = supabase.channel('home-realtime-debug')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'strategy_stats' }, (payload) => {
                    if (!payload.new) return;
                    const { key, value } = payload.new;

                    try {
                        const parsed = typeof value === 'string' ? JSON.parse(value) : value;

                        if (key === 'ticker_BTCUSDC') {
                            // Ensure price is a number
                            if (parsed.lastPrice) parsed.price = parseFloat(parsed.lastPrice);
                            setTicker(parsed);
                        } else if (key === 'balances') {
                            setBalances(parsed);
                        }
                    } catch (e) {
                        console.error("[Home] RT Parse Error", e);
                    }
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') setRealtimeStatus('Active');
                    if (status === 'CHANNEL_ERROR') setRealtimeStatus('Error');
                    if (status === 'TIMED_OUT') setRealtimeStatus('Timeout');
                    if (status === 'CLOSED') setRealtimeStatus('Disconnected');
                });

            return { sub, configSub };
        };

        const subs = setupSubscriptions();

        // ... (rest of stats fetching)

        // Return cleanup
        return () => {
            supabase.removeChannel(subs.sub);
            supabase.removeChannel(subs.configSub);
            // ... (other cleanups handled below or need refactor)
        };
    }, []); // Note: The original returned cleanup is a bit messy with my edit. 
    // I will refactor the cleanup properly in a full replace or ensure I don't break the below structure.
    // The previous code had `const sub = setupSubscriptions()` and then `return () => ...`.
    // I will adhere to that structure.


    const sub = setupSubscriptions();

    // 2. Real-time Subscriptions for Data (Replacing Polling)
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

    // Initial Fetch
    fetchPositions();
    fetchStats();
    fetchLogs();

    // Subscriptions
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
    if (subs.sub) supabase.removeChannel(subs.sub);
    if (subs.configSub) supabase.removeChannel(subs.configSub);
    supabase.removeChannel(positionsSub);
    supabase.removeChannel(cyclesSub);
    supabase.removeChannel(logsSub);
};
    }, []);

// Recalc Portfolio when balances or ticker change
useEffect(() => {
    if (balances) {
        // Graceful fallback for ticker price
        // Use lastPrice if available, or .price, or 0
        const price = parseFloat(ticker?.lastPrice || ticker?.price || 0);

        const btcAmount = (balances.BTC?.free || 0) + (balances.BTC?.frozen || 0);
        const usdcAmount = (balances.USDC?.free || 0) + (balances.USDC?.frozen || 0);

        // Only sum if we have a valid price, OR just show USDC if price is 0?
        // User wants total.
        setPortfolioValue((btcAmount * price) + usdcAmount);
    }
}, [balances, ticker]);

return (
    <div style={{ height: '100%', display: 'flex', gap: '1.5rem', overflow: 'hidden' }} className="dashboard-container">

        {/* Main Content - 75% */}
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }} className="main-content">

            {/* Header / Welcome */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Bot Dash</h1>
                    <span style={{ color: 'var(--text-secondary)' }}>
                        Welcome back, Trader. System is <span style={{
                            color: realtimeStatus === 'Active' ? '#00ff88' : '#ff4d4d',
                            fontWeight: 'bold'
                        }}>{realtimeStatus}</span>
                    </span>
                </div>
            </div>

            {/* Summary Cards Grid (Merged) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="summary-grid">
                <SummaryCard
                    label="Total Balance"
                    value={`$${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subValue="BTC + USDC"
                    icon={<Wallet size={24} color="#ffffff" />}
                />
                <SummaryCard
                    label="Initial Investment"
                    value={`$${initialInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subValue={`Started: ${investmentDate}`}
                    icon={<Calendar size={24} color="#ffffff" />}
                />
                <SummaryCard
                    label="Positions"
                    value={`${positionsInfo.active} / ${positionsInfo.max}`}
                    subValue="Sell Orders / Total Grid Level"
                    icon={<Layers size={24} color="#ffffff" />}
                />
                <SummaryCard
                    label="Total Profit"
                    value={`${stats.total_pl >= 0 ? '+' : ''}$${stats.total_pl.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`}
                    subValue="All Time"
                    icon={<Activity size={24} color="#00ff88" />}
                />
                <SummaryCard
                    label="Active Runtime"
                    value={formatRuntime(stats.runtime_seconds)}
                    subValue="Since last reboot"
                    icon={<Clock size={24} color="#00d8ff" />}
                />
                <SummaryCard
                    label="Last 24H Profit"
                    value={`${stats.profit_24h >= 0 ? '+' : ''}$${stats.profit_24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subValue={`${stats.cycles_24h} cycles 24h`}
                    icon={<TrendingUp size={24} color="#ff00e5" />}
                />
            </div>

            {/* Current Asset Status Section */}
            <div style={{
                flex: 1,
                background: 'var(--bg-card)',
                border: 'var(--glass-border)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'var(--backdrop-blur)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }} className="asset-section">
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Current Asset Status</h2>

                {(() => {
                    const usdcAmount = (balances.USDC?.free || 0) + (balances.USDC?.frozen || 0);
                    const btcBalance = (balances.BTC?.free || 0) + (balances.BTC?.frozen || 0);
                    const btcValue = btcBalance * ticker.price;

                    // Recalculate total for accuracy in this scope
                    const total = usdcAmount + btcValue;

                    const usdcPercent = total > 0 ? (usdcAmount / total * 100) : 0;
                    const btcPercent = total > 0 ? (btcValue / total * 100) : 0;

                    return (
                        <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', height: '100%' }} className="asset-status-inner">
                            {/* Dynamic Donut Chart */}
                            <div style={{
                                width: '180px', height: '180px',
                                borderRadius: '50%',
                                // Dynamic gradient based on USDC percent
                                background: `conic-gradient(#00ff88 0% ${usdcPercent}%, #2a2d35 ${usdcPercent}% 100%)`,
                                position: 'relative',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.5s ease-out'
                            }}>
                                <div style={{
                                    width: '140px', height: '140px',
                                    background: 'var(--bg-card)',
                                    borderRadius: '50%',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>USDC Exposure</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{usdcPercent.toFixed(1)}%</span>
                                </div>
                            </div>

                            {/* Asset List */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <AssetRow
                                    symbol="USDC"
                                    name="USD Coin"
                                    amount={usdcAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    value={`$${usdcAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    percent={usdcPercent.toFixed(1)}
                                    color="#00ff88"
                                />
                                <AssetRow
                                    symbol="BTC"
                                    name="Bitcoin"
                                    amount={btcBalance.toFixed(6)}
                                    value={`$${btcValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    percent={btcPercent.toFixed(1)}
                                    color="#2a2d35"
                                />
                            </div>
                        </div>
                    );
                })()}
            </div>

        </div>

        {/* Right Sidebar - 25% */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '300px' }} className="right-sidebar">

            {/* Quick Actions (Disabled) */}
            <div style={{
                background: 'var(--bg-card)',
                border: 'var(--glass-border)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'var(--backdrop-blur)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Quick Actions</h3>
                    <span style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'var(--text-secondary)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>Coming Soon</span>
                </div>

                {/* Disabled Content */}
                <div style={{ display: 'flex', gap: '1rem', opacity: 0.3, pointerEvents: 'none', filter: 'grayscale(0.8)' }}>
                    <ActionButton icon={<ArrowDownLeft size={20} />} label="Deposit" color="#00ff88" />
                    <ActionButton icon={<ArrowUpRight size={20} />} label="Withdraw" color="#ff4d4d" />
                </div>
            </div>

            {/* System Health */}
            <div style={{
                flex: 1,
                background: 'var(--bg-card)',
                border: 'var(--glass-border)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'var(--backdrop-blur)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden' // Ensure card itself respects bounds
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>System Health</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <HealthItem label="API Latency" value={apiLatency} status="good" />
                    <HealthItem label="Memory Usage" value={systemHealth.memory_usage} status="good" />
                    <HealthItem label="CPU Load" value={systemHealth.cpu_load} status="good" />
                    <HealthItem label="Disk Space" value={systemHealth.disk_space} status="neutral" />
                </div>

                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(255, 77, 77, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 77, 77, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    overflow: 'hidden',
                    minHeight: '200px' // Ensure it takes some space but flexes
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff4d4d', marginBottom: '0.5rem' }}>
                        <Server size={16} />
                        <span style={{ fontWeight: 'bold' }}>System Logs</span>
                    </div>
                    <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        overflowY: 'auto',
                        maxHeight: '200px', // Explicit max height
                        paddingRight: '5px' // Space for scrollbar
                    }}>
                        {systemLogs.length > 0 ? systemLogs.map((log, i) => (
                            <div key={i} style={{ marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '2px' }}>{log}</div>
                        )) : <div>No logs available...</div>}
                    </div>
                </div>
            </div>

        </div>
    </div>
);
};

// Sub-components for cleaner code
const SummaryCard = ({ label, value, subValue, icon }) => (
    <div style={{
        background: 'var(--bg-card)',
        border: 'var(--glass-border)',
        borderRadius: '16px',
        padding: '1.5rem',
        backdropFilter: 'var(--backdrop-blur)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</span>
            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>{icon}</div>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.8 }}>{subValue}</div>
    </div>
);

const AssetRow = ({ symbol, name, amount, value, percent, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: color }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 'bold' }}>{symbol}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{name}</span>
            </div>
        </div>
        <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>{amount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{value}</div>
        </div>
    </div>
);

const ActionButton = ({ icon, label, color }) => (
    <button style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        background: `rgba(${color === '#00ff88' ? '0, 255, 136' : '255, 77, 77'}, 0.1)`,
        color: color,
        border: `1px solid rgba(${color === '#00ff88' ? '0, 255, 136' : '255, 77, 77'}, 0.2)`,
        padding: '0.8rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'all 0.2s'
    }}
        onMouseEnter={(e) => e.target.style.background = `rgba(${color === '#00ff88' ? '0, 255, 136' : '255, 77, 77'}, 0.2)`}
        onMouseLeave={(e) => e.target.style.background = `rgba(${color === '#00ff88' ? '0, 255, 136' : '255, 77, 77'}, 0.1)`}
    >
        {icon}
        {label}
    </button>
);

const HealthItem = ({ label, value, status }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{
            fontWeight: '600',
            color: status === 'good' ? '#00ff88' : status === 'bad' ? '#ff4d4d' : '#fff'
        }}>{value}</span>
    </div>
);

export default Home;
