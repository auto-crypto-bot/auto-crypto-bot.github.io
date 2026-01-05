import React from 'react';
import { Shield } from 'lucide-react';
import Card from '../../components/ui/Card';

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

const RiskManagementForm = ({ riskPerTrade, setRiskPerTrade, stopLoss, setStopLoss, takeProfit, setTakeProfit }) => {
    return (
        <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                <Shield size={20} color="#00d8ff" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Risk Management</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="risk-grid">
                <FormInput label="Risk Per Trade (%)" value={riskPerTrade} onChange={setRiskPerTrade} type="number" step="0.1" />
                <FormInput label="Stop Loss (%)" value={stopLoss} onChange={setStopLoss} type="number" step="0.1" />
                <FormInput label="Take Profit (%)" value={takeProfit} onChange={setTakeProfit} type="number" step="0.1" />
            </div>
        </Card>
    );
};

export default RiskManagementForm;
