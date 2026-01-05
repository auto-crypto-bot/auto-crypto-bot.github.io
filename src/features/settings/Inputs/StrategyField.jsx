import React, { useState } from 'react';
import { Info } from 'lucide-react';

const StrategyField = ({ label, tooltip, value, onChange, type = "text", step }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {/* Header Row: Label + Tooltip Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: '500', color: '#fff' }}>{label}</label>
                <div
                    style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <Info size={14} color="var(--text-secondary)" style={{ cursor: 'help' }} />

                    {/* Tooltip Popup */}
                    {showTooltip && (
                        <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '-20px', // Anchor left
                            marginBottom: '10px',
                            background: '#222',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '0.6rem 0.8rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            color: '#e0e0e0',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            width: 'max-content',
                            maxWidth: '400px',
                            whiteSpace: 'normal',
                            textAlign: 'center'
                        }}>
                            {tooltip}
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: '27px',
                                transform: 'translateX(-50%)',
                                borderWidth: '5px',
                                borderStyle: 'solid',
                                borderColor: '#222 transparent transparent transparent'
                            }}></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Field */}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                step={step}
                style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    marginTop: '0.25rem',
                    width: '100%',
                    boxSizing: 'border-box'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#00ff88')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
        </div>
    );
};

export default StrategyField;
