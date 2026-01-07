import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useSettings = () => {
    // Strategy Parameters State
    const [gridLevels, setGridLevels] = useState(50);
    const [quantity, setQuantity] = useState(0.000012);
    const [gridGap, setGridGap] = useState(50.0);
    const [upperPrice, setUpperPrice] = useState(45000);
    const [lowerPrice, setLowerPrice] = useState(25000);

    // Other Mock State
    const [apiKey, setApiKey] = useState('mx0vi...A8d9');
    const [riskPerTrade, setRiskPerTrade] = useState(2.5);
    const [stopLoss, setStopLoss] = useState(1.5);
    const [takeProfit, setTakeProfit] = useState(3.0);

    const [isSaving, setIsSaving] = useState(false);
    const [isApplyingStrategy, setIsApplyingStrategy] = useState(false);
    const [fullConfig, setFullConfig] = useState({});
    const [currentPrice, setCurrentPrice] = useState(0);

    // Fetch Config on Mount
    useEffect(() => {
        const fetchConfig = async () => {
            console.log("Fetching Strategy Config...");
            const { data, error } = await supabase

                .from('bot_config')
                .select('config_json')
                .eq('symbol', 'BTCUSDC')
                .single();

            if (error) console.error("Error fetching config:", error);

            if (data?.config_json) {
                console.log("Received Config:", data.config_json);
                try {
                    const config = data.config_json;
                    setFullConfig(config);

                    if (config.max_positions !== undefined) setGridLevels(config.max_positions);
                    if (config.quantity !== undefined) setQuantity(config.quantity);
                    if (config.grid_interval !== undefined) setGridGap(config.grid_interval);
                    if (config.upper_price_limit !== undefined) setUpperPrice(config.upper_price_limit);
                    if (config.lower_price_limit !== undefined) setLowerPrice(config.lower_price_limit);
                } catch (e) {
                    console.error("Config Parse Error", e);
                    toast.error("Failed to parse configuration");
                }
            }
        };
        fetchConfig();
    }, []);

    // Live Price Subscription
    // Live Price Subscription (Binance WS)
    useEffect(() => {
        const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdc@ticker');

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.c) setCurrentPrice(parseFloat(data.c));
            } catch (e) { console.error(e); }
        };

        return () => ws.close();
    }, []);

    // Actions
    const handleSave = () => {
        setIsSaving(true);
        // Simulate save or actually save other params if they existed in DB
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Configuration saved locally");
        }, 1000);
    };

    const handleApplyStrategyParams = async () => {
        setIsApplyingStrategy(true);
        try {
            const payload = {
                ...fullConfig,
                max_positions: parseInt(gridLevels),
                quantity: parseFloat(quantity),
                grid_interval: parseFloat(gridGap),
                upper_price_limit: parseFloat(upperPrice),
                lower_price_limit: parseFloat(lowerPrice),
                profit_target: fullConfig.profit_target || 50.0,
                status: fullConfig.status || "RUNNING"
            };


            console.log("Applying Strategy Params:", payload);
            const { error } = await supabase
                .from('bot_config')
                .upsert({
                    symbol: 'BTCUSDC',
                    strategy_type: 'rolling_grid',
                    config_json: payload,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'symbol' });

            if (!error) {
                setFullConfig(payload);
                toast.success("Strategy parameters applied successfully");
            } else {
                console.error("Failed to update strategy", error);
                toast.error("Failed to apply strategy");
            }
        } catch (err) {
            console.error("Error applying strategy:", err);
            toast.error("Error applying strategy");
        } finally {
            setIsApplyingStrategy(false);
        }
    };

    // Calculation Logic
    const handleUpperPriceChange = (val) => {
        setUpperPrice(val);
        const v = parseFloat(val);
        if (!isNaN(v) && gridLevels && gridGap) {
            const calculatedLower = v - (parseInt(gridLevels) * parseFloat(gridGap));
            setLowerPrice(calculatedLower > 0 ? calculatedLower : 0);
        }
    };

    const handleLowerPriceChange = (val) => {
        setLowerPrice(val);
        const v = parseFloat(val);
        if (!isNaN(v) && gridLevels && gridGap) {
            const calculatedUpper = v + (parseInt(gridLevels) * parseFloat(gridGap));
            setUpperPrice(calculatedUpper);
        }
    };

    return {
        gridLevels, setGridLevels,
        quantity, setQuantity,
        gridGap, setGridGap,
        upperPrice, setUpperPrice, handleUpperPriceChange,
        lowerPrice, setLowerPrice, handleLowerPriceChange,
        apiKey, setApiKey,
        riskPerTrade, setRiskPerTrade,
        stopLoss, setStopLoss,
        takeProfit, setTakeProfit,
        isSaving, handleSave,
        isApplyingStrategy, handleApplyStrategyParams,
        currentPrice
    };
};
