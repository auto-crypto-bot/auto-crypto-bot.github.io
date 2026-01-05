import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useBotStatus = () => {
    const [botStatus, setBotStatus] = useState('CONNECTING');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchStatus = async () => {
            try {
                const { data, error } = await supabase
                    .from('bot_control')
                    .select('status')
                    .eq('id', 1)
                    .single();

                if (error) throw error;
                if (mounted && data) setBotStatus(data.status);
            } catch (err) {
                console.error('Error fetching bot status:', err);
                toast.error('Failed to fetch bot status');
                if (mounted) setBotStatus('ERROR');
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        fetchStatus();

        const subscription = supabase.channel('bot-status-hook')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bot_control', filter: 'id=eq.1' }, (payload) => {
                if (payload.new) {
                    setBotStatus(payload.new.status);

                    // Only toast on status CHANGE
                    if (payload.old && payload.old.status !== payload.new.status) {
                        if (payload.new.status === 'RUNNING') toast.success('Bot Service Started');
                        if (payload.new.status === 'STOPPED') toast.info('Bot Service Stopped');
                    }
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // console.log('Bot status subscription active');
                }
            });

        return () => {
            mounted = false;
            supabase.removeChannel(subscription);
        };
    }, []);

    return { botStatus, isLoading };
};
