import React from 'react';
import Card from '../../components/ui/Card';
import LogViewer from './LogViewer';

const HealthItem = ({ label, value, status }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{
            fontWeight: '600',
            color: status === 'good' ? '#00ff88' : status === 'bad' ? '#ff4d4d' : '#fff'
        }}>{value}</span>
    </div>
);

const SystemHealthList = ({ health, logs, apiLatency }) => {
    return (
        <Card style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>System Health</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <HealthItem label="API Latency" value={apiLatency} status="good" />
                <HealthItem label="Memory Usage" value={health.memory_usage} status="good" />
                <HealthItem label="CPU Load" value={health.cpu_load} status="good" />
                <HealthItem label="Disk Space" value={health.disk_space} status="neutral" />
            </div>

            <LogViewer logs={logs} />
        </Card>
    );
};

export default SystemHealthList;
