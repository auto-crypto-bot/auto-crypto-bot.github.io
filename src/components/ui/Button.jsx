import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon = null,
    loading = false,
    disabled = false,
    onClick,
    style = {},
    ...props
}) => {

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    background: '#00ff88',
                    color: '#000',
                    border: 'none',
                };
            case 'secondary':
                return {
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                };
            case 'danger':
                return {
                    background: 'rgba(255, 77, 77, 0.1)',
                    color: '#ff4d4d',
                    border: '1px solid rgba(255, 77, 77, 0.2)',
                };
            case 'ghost':
                return {
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: 'none',
                };
            default:
                return {};
        }
    };

    const baseStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        borderRadius: '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        fontSize: size === 'sm' ? '0.8rem' : size === 'lg' ? '1.1rem' : '0.95rem',
        padding: size === 'sm' ? '0.4rem 0.8rem' : size === 'lg' ? '1rem 2rem' : '0.8rem 1.2rem',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        outline: 'none',
        boxShadow: variant === 'primary' ? '0 4px 12px rgba(0, 255, 136, 0.2)' : 'none',
        ...getVariantStyles(),
        ...style,
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            style={baseStyles}
            {...props}
            onMouseEnter={(e) => {
                if (!disabled && !loading) {
                    e.currentTarget.style.filter = 'brightness(1.1)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'none';
            }}
        >
            {loading ? (
                <span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span>
            ) : icon}
            {children}
        </button>
    );
};

export default Button;
