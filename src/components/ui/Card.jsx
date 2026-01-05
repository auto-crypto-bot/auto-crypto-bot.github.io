import React from 'react';

const Card = ({ children, className = '', style = {}, ...props }) => {
    return (
        <div
            style={{
                background: 'var(--bg-card)',
                border: 'var(--glass-border)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'var(--backdrop-blur)',
                ...style
            }}
            className={`ui-card ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
