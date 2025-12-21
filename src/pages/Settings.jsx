import React, { useState } from 'react';
import { Save, RefreshCw, Shield, Key, Sliders, Download, Terminal, AlertTriangle } from 'lucide-react';

const Settings = () => {
    // Mock State for Form Fields
    const [apiKey, setApiKey] = useState('mx0vi...A8d9');
    const [apiSecret, setApiSecret] = useState('****************');
    const [riskPerTrade, setRiskPerTrade] = useState(2.5);
    const [stopLoss, setStopLoss] = useState(1.5);
    const [takeProfit, setTakeProfit] = useState(3.0);
    const [gridLevels, setGridLevels] = useState(20);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <div style={{ height: '100%', display: 'flex', gap: '1.5rem', overflow: 'hidden' }}>

            {/* Main Center Area - 75% */}
            <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>System Configuration</h1>

                {/* API Configuration Section */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'var(--backdrop-blur)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                        <Key size={20} color="#00ff88" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>API Connection</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <FormInput label="Exchange" value="MEXC Global" disabled={true} />
                        <FormInput label="Environment" value="Production" disabled={true} />
                        <FormInput label="API Key" value={apiKey} onChange={setApiKey} type="text" />
                        <FormInput label="API Secret" value={apiSecret} onChange={setApiSecret} type="password" />
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#ff4d4d', alignItems: 'center' }}>
                        <AlertTriangle size={14} />
                        <span>Never share your API keys. Keys stored locally are encrypted.</span>
                    </div>
                </div>

                {/* Trading Variables Section */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'var(--backdrop-blur)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                        <Shield size={20} color="#00d8ff" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Risk Management</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <FormInput label="Risk Per Trade (%)" value={riskPerTrade} onChange={setRiskPerTrade} type="number" step="0.1" />
                        <FormInput label="Stop Loss (%)" value={stopLoss} onChange={setStopLoss} type="number" step="0.1" />
                        <FormInput label="Take Profit (%)" value={takeProfit} onChange={setTakeProfit} type="number" step="0.1" />
                    </div>
                </div>

                {/* Strategy Parameters Section */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'var(--backdrop-blur)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                        <Sliders size={20} color="#ff00e5" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Strategy Parameters</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <FormInput label="Active Strategy" value="Rolling Grid V2" disabled={true} />
                        <FormInput label="Grid Levels" value={gridLevels} onChange={setGridLevels} type="number" />
                        <FormInput label="Upper Price Limit" value="45000" type="number" />
                        <FormInput label="Lower Price Limit" value="25000" type="number" />
                    </div>
                </div>

            </div>

            {/* Right Sidebar - 25% */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '300px' }}>

                {/* Actions Panel */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'var(--backdrop-blur)'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                width: '100%', padding: '1rem',
                                background: isSaving ? '#00cc6a' : '#00ff88',
                                color: '#000', border: 'none', borderRadius: '8px',
                                fontWeight: 'bold', cursor: 'pointer',
                                transition: 'all 0.2s',
                                opacity: isSaving ? 0.8 : 1
                            }}
                        >
                            {isSaving ? <RefreshCw className="spin" size={18} /> : <Save size={18} />}
                            {isSaving ? 'Saving...' : 'Save Configuration'}
                        </button>

                        <button style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            width: '100%', padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                            fontWeight: '600', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}>
                            <Download size={18} color="var(--text-secondary)" />
                            Export Logs
                        </button>
                    </div>
                </div>

                {/* System Info */}
                <div style={{
                    flex: 1,
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'var(--backdrop-blur)',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Terminal size={20} color="var(--text-secondary)" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>System Info</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <InfoRow label="Bot Version" value="v2.4.1 (Stable)" />
                        <InfoRow label="Build Options" value="Optimized" />
                        <InfoRow label="Server Time" value="20:42:15 UTC" />
                        <InfoRow label="Uptime" value="14d 02h 15m" />
                        <InfoRow label="Node Region" value="Asia-East (Tokyo)" />
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            System ID: ag-8829-xc1<br />
                            License: Commercial Pro
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Reusable Form Components
const FormInput = ({ label, value, onChange, type = "text", disabled = false, step }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disabled}
            step={step}
            style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                color: disabled ? 'var(--text-secondary)' : '#fff',
                outline: 'none',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
                cursor: disabled ? 'not-allowed' : 'text'
            }}
            onFocus={(e) => !disabled && (e.target.style.borderColor = '#00ff88')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
        />
    </div>
);

const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</span>
        <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{value}</span>
    </div>
);

// CSS for spinner (could be in global css, but inline for now)
const style = document.createElement('style');
style.textContent = `
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(style);

export default Settings;
