import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const LiveActivity = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                // Fetch active positions (Recent Buys)
                const { data: activeData, error: activeError } = await supabase
                    .from('active_positions')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20);

                // Fetch completed cycles (Recent Sells)
                const { data: completedData, error: completedError } = await supabase
                    .from('completed_cycles')
                    .select('*')
                    .order('closed_at', { ascending: false })
                    .limit(20);

                if (activeError) console.error("Error fetching active positions:", activeError);
                if (completedError) console.error("Error fetching completed cycles:", completedError);

                formatAndSet(activeData || [], completedData || []);
            } catch (e) {
                console.error("Fetch Activity Error:", e);
            }
        };

        const formatAndSet = (active, completed) => {
            const buys = active.map(t => ({
                id: `buy-${t.id}`,
                type: 'buy',
                message: 'Buy Order Filled',
                price: t.entry_price,
                quantity: t.entry_quantity,
                created_at: t.created_at
            }));

            const sells = completed.map(t => ({
                id: `sell-${t.id}`,
                type: 'sell',
                message: `Sell Executed (+$${parseFloat(t.gross_profit || 0).toFixed(2)})`,
                price: t.exit_price,
                quantity: t.quantity || t.entry_quantity, // Fallback if quantity not in completed (usually it is)
                created_at: t.closed_at
            }));

            // Merge and sort
            const unified = [...buys, ...sells].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50);

            setLogs(unified.map(item => {
                const date = new Date(item.created_at);
                return {
                    id: item.id,
                    type: item.type,
                    message: item.message,
                    details: `${parseFloat(item.quantity || 0)} BTC @ $${parseFloat(item.price).toLocaleString()}`,
                    time: date.toLocaleTimeString('en-US', { hour12: false })
                };
            }));
        };

        fetchActivity();

        const subscription = supabase
            .channel('activity-feed-v3')
            // Listen for NEW Buys
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'active_positions' }, (payload) => {
                console.log("[Activity] New Buy Event:", payload);
                const newRec = payload.new;
                handleNewLog({
                    id: `buy-${newRec.id}`,
                    type: 'buy',
                    message: 'Buy Order Filled',
                    price: newRec.entry_price,
                    quantity: newRec.entry_quantity,
                    created_at: newRec.created_at
                });
            })
            // Listen for NEW Sells
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'completed_cycles' }, (payload) => {
                console.log("[Activity] New Sell Event:", payload);
                const rec = payload.new;
                handleNewLog({
                    id: `sell-${rec.id}`,
                    type: 'sell',
                    message: `Sell Executed (+$${parseFloat(rec.gross_profit || 0).toFixed(2)})`,
                    price: rec.exit_price,
                    quantity: rec.quantity,
                    created_at: rec.closed_at
                });
            })
            .subscribe();

        const handleNewLog = (data) => {
            setLogs(prev => {
                if (prev.find(l => l.id === data.id)) return prev;

                const date = new Date(data.created_at || Date.now());
                const item = {
                    id: data.id,
                    type: data.type,
                    message: data.message,
                    details: `${parseFloat(data.quantity || 0)} BTC @ $${parseFloat(data.price).toLocaleString()}`,
                    time: date.toLocaleTimeString('en-US', { hour12: false })
                };
                return [item, ...prev].slice(0, 50);
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
