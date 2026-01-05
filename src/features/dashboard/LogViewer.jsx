import React from 'react';
import { Server } from 'lucide-react';
import Card from '../../components/ui/Card';

const LogViewer = ({ logs }) => {
    return (
        <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(255, 77, 77, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 77, 77, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
            minHeight: '200px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff4d4d', marginBottom: '0.5rem' }}>
                <Server size={16} />
                <span style={{ fontWeight: 'bold' }}>System Logs</span>
            </div>
            <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                overflowY: 'auto',
                maxHeight: '200px',
                paddingRight: '5px'
            }}>
                {logs.length > 0 ? logs.map((log, i) => (
                    <div key={i} style={{ marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '2px' }}>{log}</div>
                )) : <div>No logs available...</div>}
            </div>
        </div>
    );
};

export default LogViewer;
