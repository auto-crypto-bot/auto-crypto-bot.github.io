import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Activity, Clock, Server, TrendingUp, Calendar, Layers } from 'lucide-react';

const Home = () => {
    // State
    const [portfolioValue, setPortfolioValue] = useState(0);
    const [balances, setBalances] = useState({ BTC: { free: 0, frozen: 0 }, USDC: { free: 0, frozen: 0 } });
    const [ticker, setTicker] = useState({ price: 0 });
    const [positionsInfo, setPositionsInfo] = useState({ active: 0, max: 40 });
    const [stats, setStats] = useState({ total_pl: 0, runtime_seconds: 0, profit_24h: 0, cycles_24h: 0 });
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
        const fetchData = async () => {
            try {
                // Fetch Balances
                const balanceRes = await fetch('/api/balances');
                const balanceData = await balanceRes.json();

                // Fetch Ticker
                const tickerRes = await fetch('/api/v3/ticker/24hr?symbol=BTCUSDC');
                const tickerData = await tickerRes.json();

                // Fetch Positions & Config
                const posRes = await fetch('/api/positions');
                const posData = await posRes.json();
                const configRes = await fetch('/api/config');
                const configData = await configRes.json();

                // Fetch Stats
                const statsRes = await fetch('/api/stats');
                const statsData = await statsRes.json();

                // Fetch System Health & Logs
                const healthRes = await fetch('/api/system/health');
                const healthData = await healthRes.json();

                const logsRes = await fetch('/api/system/logs');
                const logsData = await logsRes.json();

                if (balanceData && tickerData) {
                    setBalances({
                        BTC: balanceData.BTC || { free: 0, frozen: 0 },
                        USDC: balanceData.USDC || { free: 0, frozen: 0 }
                    });

                    const btcPrice = parseFloat(tickerData.lastPrice || 0);
                    const btcAmount = (balanceData.BTC?.free || 0) + (balanceData.BTC?.frozen || 0);
                    const usdcAmount = (balanceData.USDC?.free || 0) + (balanceData.USDC?.frozen || 0);

                    const totalVal = (btcAmount * btcPrice) + usdcAmount;
                    setPortfolioValue(totalVal);
                    setTicker({ price: btcPrice });
                }

                if (posData && configData) {
                    // Count only positions with limit sell (TP_PLACED)
                    const activeCount = posData.filter(p => p.status === 'TP_PLACED').length;
                    setPositionsInfo({
                        active: activeCount,
                        max: configData.max_positions || 40,
                        quantity: configData.quantity || 0
                    });
                }

                if (statsData) {
                    setStats(statsData);
                }

                if (healthData) {
                    setSystemHealth(healthData);
                }

                if (logsData) {
                    setSystemLogs(logsData);
                }

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ height: '100%', display: 'flex', gap: '1.5rem', overflow: 'hidden' }} className="dashboard-container">

            {/* Main Content - 75% */}
            <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }} className="main-content">

                {/* Header / Welcome */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Bot Dash</h1>
                        <span style={{ color: 'var(--text-secondary)' }}>Welcome back, Trader. System is <span style={{ color: '#00ff88' }}>Active</span></span>
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
                        subValue="Active / Max"
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
