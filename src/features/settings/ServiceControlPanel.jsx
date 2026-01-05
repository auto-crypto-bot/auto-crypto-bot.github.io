import React from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

const ServiceControlPanel = () => {
    const sendCommand = async (cmd) => {
        console.log(`[ServiceControl] Sending Command: ${cmd}`);
        const { error } = await supabase
            .from('bot_control')
            .update({ command: cmd })
            .eq('id', 1);

        if (error) {
            console.error(`[ServiceControl] Failed to send ${cmd}:`, error);
        } else {
            console.log(`[ServiceControl] Command ${cmd} sent successfully.`);
        }
    };

    return (
        <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                <Zap size={20} color="#ffd700" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Service Control</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Button
                    variant="primary"
                    style={{ background: 'rgba(0, 255, 136, 0.15)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.3)' }}
                    onClick={() => sendCommand('START')}
                >
                    START
                </Button>
                <Button
                    variant="danger"
                    style={{ background: 'rgba(255, 77, 77, 0.15)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.3)' }}
                    onClick={() => sendCommand('STOP')}
                >
                    STOP
                </Button>
            </div>
            <Button
                variant="ghost"
                style={{
                    width: '100%',
                    background: 'rgba(255, 215, 0, 0.15)',
                    color: '#ffd700',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                }}
                icon={<RefreshCw size={16} />}
                onClick={() => sendCommand('RESTART')}
            >
                RESTART SERVICE
            </Button>
        </Card>
    );
};

export default ServiceControlPanel;
