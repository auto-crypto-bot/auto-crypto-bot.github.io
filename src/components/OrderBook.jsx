import React from 'react';

const OrderBook = () => {
    // Mock Data
    const asks = [
        { price: 44550, amount: 0.5 },
        { price: 44540, amount: 1.2 },
        { price: 44530, amount: 0.8 },
        { price: 44520, amount: 2.5 },
        { price: 44510, amount: 1.5 },
    ];

    const bids = [
        { price: 44500, amount: 3.2 },
        { price: 44490, amount: 1.8 },
        { price: 44480, amount: 0.9 },
        { price: 44470, amount: 1.4 },
        { price: 44460, amount: 2.1 },
    ];

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
                Order Book
            </h3>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                {/* Asks (Sells) - Red */}
                <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '2px', marginBottom: '0.5rem' }}>
                    {asks.map((ask, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0.5rem', position: 'relative' }}>
                            <div style={{
                                position: 'absolute', right: 0, top: 0, bottom: 0,
                                width: `${(ask.amount / 3) * 100}%`,
                                background: 'rgba(255, 77, 77, 0.1)',
                                zIndex: 0
                            }} />
                            <span style={{ color: '#ff4d4d', zIndex: 1, fontWeight: 500 }}>{ask.price}</span>
                            <span style={{ color: 'var(--text-secondary)', zIndex: 1 }}>{ask.amount.toFixed(4)}</span>
                        </div>
                    ))}
                </div>

                <div style={{
                    textAlign: 'center',
                    padding: '0.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                }}>
                    44,505.00
                </div>

                {/* Bids (Buys) - Green */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '0.5rem' }}>
                    {bids.map((bid, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0.5rem', position: 'relative' }}>
                            <div style={{
                                position: 'absolute', right: 0, top: 0, bottom: 0,
                                width: `${(bid.amount / 4) * 100}%`,
                                background: 'rgba(0, 255, 136, 0.1)',
                                zIndex: 0
                            }} />
                            <span style={{ color: '#00ff88', zIndex: 1, fontWeight: 500 }}>{bid.price}</span>
                            <span style={{ color: 'var(--text-secondary)', zIndex: 1 }}>{bid.amount.toFixed(4)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrderBook;
