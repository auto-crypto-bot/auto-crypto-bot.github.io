import React from 'react';

const Badge = ({ status = 'neutral', children }) => {
    const getColors = () => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'running':
            case 'good':
                return { bg: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.2)' };
            case 'stopped':
            case 'error':
            case 'bad':
            case 'disconnected':
                return { bg: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.2)' };
            case 'warning':
            case 'connecting':
                return { bg: 'rgba(255, 215, 0, 0.1)', color: '#ffd700', border: '1px solid rgba(255, 215, 0, 0.2)' };
            default:
                return { bg: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' };
        }
    };

    const colors = getColors();

    return (
        <span
            style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: colors.bg,
                color: colors.color,
                border: colors.border,
            }}
        >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.color }}></span>
            {children || status}
        </span>
    );
};

export default Badge;
