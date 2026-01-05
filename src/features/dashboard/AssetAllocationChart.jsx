import React from 'react';
import Card from '../../components/ui/Card';

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

const AssetAllocationChart = ({ balances, ticker }) => {
    const usdcAmount = (balances.USDC?.free || 0) + (balances.USDC?.frozen || 0);
    const btcBalance = (balances.BTC?.free || 0) + (balances.BTC?.frozen || 0);
    const btcValue = btcBalance * (ticker.lastPrice || ticker.price || 0);

    // Recalculate total for accuracy in this scope
    const total = usdcAmount + btcValue;

    const usdcPercent = total > 0 ? (usdcAmount / total * 100) : 0;
    const btcPercent = total > 0 ? (btcValue / total * 100) : 0;

    return (
        <Card style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }} className="asset-section">
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Current Asset Status</h2>
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
        </Card>
    );
};

export default AssetAllocationChart;
