import React from 'react';

const DashboardHeader = ({ realtimeStatus }) => {
    return (
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
    );
};

export default DashboardHeader;
