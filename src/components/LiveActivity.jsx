import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const LiveActivity = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchActivity = async () => {
            const { data } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'FILLED')
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) formatAndSet(data);
        };

        const formatAndSet = (rawData) => {
            const formatted = rawData.map((t, idx) => {
                const isBuy = t.side === 'BUY';
                const date = new Date(t.created_at);
                const timeStr = date.toLocaleTimeString('en-US', { hour12: false });

                return {
                    id: t.order_id || t.id || idx,
                    type: isBuy ? 'buy' : 'sell',
                    message: isBuy ? 'Buy Order Executed' : 'Sell Order Executed',
                    details: `${parseFloat(t.orig_qty || t.quantity || 0)} BTC @ $${parseFloat(t.price).toLocaleString()}`,
                    time: timeStr
                };
            });
            setLogs(formatted);
        };

        fetchActivity();

        const subscription = supabase
            .channel('activity-feed-v2')
            // Listen for NEW Buys and Buy Fills
            .on('postgres_changes', { event: '*', schema: 'public', table: 'active_positions' }, (payload) => {
                const newRec = payload.new;
                if (!newRec) return;

                // Check if it's a Buy Fill (Internal status in metadata or just mapped)
                // We use metadata.internal_status or check if status changed to OPEN/FILLED?
                // active_positions: status starts OPEN.
                // We can just log "Buy Order Placed" on INSERT? or "Executed"?
                // Let's log INSERT as "Buy Placed" and if we can detect fill...
                // storage.py updates `active_positions` with meta_data={'internal_status': 'FILLED_BUY'}

                if (payload.eventType === 'INSERT') {
                    handleNewLog({
                        id: newRec.id,
                        side: 'BUY',
                        price: newRec.entry_price,
                        quantity: newRec.entry_quantity,
                        created_at: newRec.created_at,
                        message_override: 'Buy Order Placed'
                    });
                } else if (payload.eventType === 'UPDATE') {
                    if (newRec.meta_data && newRec.meta_data.internal_status === 'FILLED_BUY' && payload.old && payload.old.meta_data?.internal_status !== 'FILLED_BUY') {
                        handleNewLog({
                            id: newRec.id,
                            side: 'BUY',
                            price: newRec.entry_price,
                            quantity: newRec.entry_quantity,
                            created_at: new Date().toISOString(),
                            message_override: 'Buy Order Filled'
                        });
                    }
                }
            })
            // Listen for Sells (Cycle Complete)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'completed_cycles' }, (payload) => {
                const rec = payload.new;
                handleNewLog({
                    id: rec.id,
                    side: 'SELL',
                    price: rec.exit_price,
                    quantity: rec.quantity,
                    created_at: rec.closed_at,
                    message_override: `Sell Executed (+$${parseFloat(rec.gross_profit).toFixed(2)})`
                });
            })
            .subscribe();

        const handleNewLog = (data) => {
            setLogs(prev => {
                if (prev.find(l => l.id === data.id)) return prev;

                const isBuy = data.side === 'BUY';
                const date = new Date(data.created_at || Date.now());
                const item = {
                    id: data.id,
                    type: isBuy ? 'buy' : 'sell',
                    message: data.message_override || (isBuy ? 'Buy Order Executed' : 'Sell Order Executed'),
                    details: `${parseFloat(data.quantity || 0)} BTC @ $${parseFloat(data.price).toLocaleString()}`,
                    time: date.toLocaleTimeString('en-US', { hour12: false })
                };
                return [item, ...prev].slice(0, 20);
            });
        };

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'buy': return <ArrowUpRight size={16} color="#00ff88" />;
            case 'sell': return <ArrowDownRight size={16} color="#ff4d4d" />;
            default: return <AlertCircle size={16} color="#ffaa00" />;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
                padding: '0 0.5rem'
            }}>
                Live Activity
            </h3>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                paddingRight: '4px' // Space for scrollbar
            }}>
                {logs.length === 0 && (
                    <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        No recent activity...
                    </div>
                )}
                {logs.map((log) => (
                    <div key={log.id} style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem'
                    }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px',
                            padding: '4px',
                            display: 'flex'
                        }}>
                            {getIcon(log.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '500', color: log.type === 'buy' ? '#00ff88' : log.type === 'sell' ? '#ff4d4d' : 'var(--text-primary)' }}>
                                    {log.message}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.time}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.details}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveActivity;
