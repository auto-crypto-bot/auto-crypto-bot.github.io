import React, { useState, useEffect } from 'react';
import CandleChart from '../components/CandleChart';
import LiveActivity from '../components/LiveActivity';
import { Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Live = () => {
    const [timeframe, setTimeframe] = useState('1m');
    const [ticker, setTicker] = useState(null);
    const symbol = "BTCUSDC";

    // Real-time Ticker from Supabase
    useEffect(() => {
        const fetchInitialTicker = async () => {
            const { data } = await supabase
                .from('strategy_stats')
                .select('value')
                .eq('key', `ticker_${symbol}`)
                .single();
            if (data?.value) {
                try {
                    setTicker(JSON.parse(data.value));
                } catch (e) {
                    console.error("Ticker Parse Error", e);
                }
            }
        };

        fetchInitialTicker();

        const subscription = supabase
            .channel('ticker-updates')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'strategy_stats',
                filter: `key=eq.ticker_${symbol}`
            }, (payload) => {
                if (payload.new && payload.new.value) {
                    try {
                        const val = payload.new.value;
                        setTicker(typeof val === 'string' ? JSON.parse(val) : val);
                    } catch (e) { console.error(e); }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [symbol]);

    const formatPrice = (p) => p ? parseFloat(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---';
    const formatChange = (c) => c ? parseFloat(c).toFixed(2) : '0.00';

    return (
        <div className="live-layout" style={{ height: '100%', display: 'flex', gap: '1.5rem', overflow: 'hidden' }}>
            {/* Main Chart Section */}
            <div className="chart-section" style={{
                flex: 3,
                background: 'var(--bg-card)',
                border: 'var(--glass-border)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'var(--backdrop-blur)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden'
            }}>
                {/* Header & Controls */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: 'var(--glass-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.2)'
                }} className="chart-header">
                    {/* Left: Ticker Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="ticker-info">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                BTC/USDC
                                <span style={{ fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>SPOT</span>
                            </span>
                            {ticker && (
                                <span style={{
                                    color: parseFloat(ticker.priceChangePercent) >= 0 ? '#00ff88' : '#ff4d4d',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    display: 'flex', alignItems: 'center', gap: '0.25rem'
                                }}>
                                    ${formatPrice(ticker.lastPrice)}
                                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                        {parseFloat(ticker.priceChangePercent) >= 0 ? '+' : ''}{formatChange(ticker.priceChangePercent)}%
                                    </span>
                                </span>
                            )}
                        </div>

                        {/* 24h Stats */}
                        {ticker && (
                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="ticker-stats">
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ opacity: 0.6 }}>24h High</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{formatPrice(ticker.highPrice)}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ opacity: 0.6 }}>24h Low</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{formatPrice(ticker.lowPrice)}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ opacity: 0.6 }}>24h Vol(BTC)</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{formatPrice(ticker.volume)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="chart-controls">
                        {/* Timeframe Selector */}
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
                            {['1m', '5m', '60m'].map((tf) => (
                                <button
                                    key={tf}
                                    onClick={() => setTimeframe(tf)}
                                    style={{
                                        background: timeframe === tf ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: timeframe === tf ? '#fff' : 'var(--text-secondary)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.8rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tf === '60m' ? '1H' : tf.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <div className="divider" style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />

                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
                            <Settings size={18} />
                        </button>
                    </div>
                </div>

                {/* Chart Area */}
                <div style={{ flex: 1, position: 'relative', width: '100%' }}>
                    <CandleChart interval={timeframe} />
                </div>
            </div>

            {/* Right Sidebar - 25% Width */}
            <div className="activity-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '300px' }}>

                {/* Live Activity Feed */}
                <div style={{
                    flex: 1,
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1rem',
                    backdropFilter: 'var(--backdrop-blur)',
                    overflow: 'hidden',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <LiveActivity />
                </div>
            </div>
        </div>
    );
};

export default Live;
