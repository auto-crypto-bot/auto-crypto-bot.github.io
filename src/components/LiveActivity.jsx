import React from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle } from 'lucide-react';

const LiveActivity = () => {
    const [logs, setLogs] = React.useState([]);

    React.useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await fetch('/api/trades?limit=20');
                const data = await res.json();

                const formatted = data.map((t, idx) => {
                    const isBuy = t.side === 'BUY';
                    const date = new Date(t.time);
                    const timeStr = date.toLocaleTimeString('en-US', { hour12: false });

                    return {
                        id: idx,
                        type: isBuy ? 'buy' : 'sell',
                        message: isBuy ? 'Buy Order Executed' : 'Sell Order Executed',
                        details: `${parseFloat(t.quantity)} BTC @ $${parseFloat(t.price).toLocaleString()}`,
                        time: timeStr
                    };
                });
                setLogs(formatted);
            } catch (e) {
                console.error("Failed to fetch activity", e);
            }
        };

        fetchActivity();
        const interval = setInterval(fetchActivity, 2000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'buy': return <ArrowUpRight size={16} color="#00ff88" />;
            case 'sell': return <ArrowDownRight size={16} color="#ff4d4d" />;
            default: return <AlertCircle size={16} color="#ffaa00" />;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
                padding: '0 0.5rem'
            }}>
                Live Activity
            </h3>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                paddingRight: '4px' // Space for scrollbar
            }}>
                {logs.length === 0 && (
                    <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        No recent activity...
                    </div>
                )}
                {logs.map((log) => (
                    <div key={log.id} style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem'
                    }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px',
                            padding: '4px',
                            display: 'flex'
                        }}>
                            {getIcon(log.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '500', color: log.type === 'buy' ? '#00ff88' : log.type === 'sell' ? '#ff4d4d' : 'var(--text-primary)' }}>
                                    {log.message}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.time}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.details}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveActivity;
