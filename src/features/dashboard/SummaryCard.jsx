import React from 'react';
import Card from '../../components/ui/Card';

const SummaryCard = ({ label, value, subValue, icon }) => (
    <Card style={{ gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</span>
            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>{icon}</div>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.8 }}>{subValue}</div>
    </Card>
);

export default SummaryCard;
