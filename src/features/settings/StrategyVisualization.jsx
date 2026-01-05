import React from 'react';

const StrategyVisualization = ({ gridLevels, upperPrice, lowerPrice, currentPrice }) => {
    // Basic validation
    const levels = parseInt(gridLevels) || 0;
    const upper = parseFloat(upperPrice) || 0;
    const lower = parseFloat(lowerPrice) || 0;
    const range = upper - lower;
    const cur = parseFloat(currentPrice) || 0;

    // Fallback if config invalid
    if (range <= 0 || levels <= 0) {
        return (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                Invalid Configuration
            </div>
        );
    }

    // Calculate Buy/Sell order split
    const step = range / levels;

    let buyOrders = 0;
    let sellOrders = 0;

    if (cur >= upper) {
        buyOrders = levels;
        sellOrders = 0;
    } else if (cur <= lower) {
        sellOrders = levels;
        buyOrders = 0;
    } else {
        const priceAboveLower = cur - lower;
        buyOrders = Math.floor(priceAboveLower / step);
        sellOrders = levels - buyOrders;
    }

    // Visual percent calculation
    let rawPercent = ((cur - lower) / range) * 100;
    const VISUAL_MIN = 25;
    const VISUAL_MAX = 75;
    const VISUAL_RANGE = VISUAL_MAX - VISUAL_MIN;
    const clampedInput = Math.max(0, Math.min(100, rawPercent));
    const visualPercent = VISUAL_MIN + ((clampedInput / 100) * VISUAL_RANGE);

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            padding: '2rem 1.5rem',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '540px',
            position: 'relative',
            isolation: 'isolate'
        }}>
            <div style={{
                position: 'relative',
                width: '100%',
                flex: 1,
                marginLeft: '10px'
            }}>
                {/* Vertical Center Line */}
                <div style={{
                    position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    borderLeft: '1px dashed rgba(255,255,255,0.1)', zIndex: -1
                }}></div>

                {/* Upper Limit */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: '2px dashed #ff3c3c' }}>
                    <span style={{ position: 'absolute', right: 0, bottom: '5px', fontSize: '0.8rem', color: '#ff3c3c' }}>Upper: {upper.toFixed(2)}</span>
                </div>

                {/* Sell Orders Box */}
                <div style={{
                    position: 'absolute',
                    top: `${(100 - visualPercent) / 2}%`,
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                    background: '#1a1d21',
                    border: '1px solid rgba(255, 60, 60, 0.4)',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    color: '#ffaaaa',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    Sell Orders x{sellOrders}
                </div>

                {/* Price Line */}
                <div style={{
                    position: 'absolute',
                    bottom: `${visualPercent}%`,
                    left: '-20px',
                    right: 0,
                    borderBottom: '2px dashed #fff',
                    transition: 'bottom 0.5s ease-out',
                    zIndex: 2
                }}>
                    <span style={{
                        position: 'absolute', left: '50%', top: '-12px', transform: 'translate(-50%)',
                        background: 'var(--bg-card)', padding: '0 10px', fontSize: '0.9rem', color: '#fff', fontWeight: 'bold'
                    }}>
                        Price: {cur.toFixed(2)}
                    </span>
                </div>

                {/* Buy Orders Box */}
                <div style={{
                    position: 'absolute',
                    bottom: `${visualPercent / 2}%`,
                    left: '50%',
                    transform: 'translate(-50%, 50%)',
                    zIndex: 2,
                    background: '#16231b',
                    border: '1px solid rgba(0, 255, 136, 0.4)',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    color: '#aaffcc',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    Buy Orders x{buyOrders}
                </div>

                {/* Lower Limit */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderBottom: '2px dashed #00ff88' }}>
                    <span style={{ position: 'absolute', right: 0, top: '5px', fontSize: '0.8rem', color: '#00ff88' }}>Lower: {lower.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default StrategyVisualization;
