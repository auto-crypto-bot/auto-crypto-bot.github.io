import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Shield, Key, Sliders, Download, Terminal, AlertTriangle, Info, Zap } from 'lucide-react';

import { supabase } from '../lib/supabase';

const Settings = () => {
    // Strategy Parameters State
    const [gridLevels, setGridLevels] = useState(50); // Maps to max_positions
    const [quantity, setQuantity] = useState(0.000012);
    const [gridGap, setGridGap] = useState(50.0);
    const [upperPrice, setUpperPrice] = useState(45000);
    const [lowerPrice, setLowerPrice] = useState(25000);

    // Other Mock State
    const [apiKey, setApiKey] = useState('mx0vi...A8d9');
    const [apiSecret, setApiSecret] = useState('****************');
    const [riskPerTrade, setRiskPerTrade] = useState(2.5);
    const [stopLoss, setStopLoss] = useState(1.5);
    const [takeProfit, setTakeProfit] = useState(3.0);

    const [isSaving, setIsSaving] = useState(false);
    const [isApplyingStrategy, setIsApplyingStrategy] = useState(false);
    const [fullConfig, setFullConfig] = useState({});

    // Live Price State
    const [currentPrice, setCurrentPrice] = useState(0);

    useEffect(() => {
        const fetchConfig = async () => {
            const { data } = await supabase
                .from('strategy_stats')
                .select('value')
                .eq('key', 'bot_configuration')
                .single();

            if (data?.value) {
                try {
                    const config = JSON.parse(data.value);
                    setFullConfig(config);

                    // Map config keys to state
                    if (config.max_positions !== undefined) setGridLevels(config.max_positions);
                    if (config.quantity !== undefined) setQuantity(config.quantity);
                    if (config.grid_interval !== undefined) setGridGap(config.grid_interval);

                    if (config.upper_price_limit !== undefined) setUpperPrice(config.upper_price_limit);
                    if (config.lower_price_limit !== undefined) setLowerPrice(config.lower_price_limit);
                } catch (e) {
                    console.error("Config Parse Error", e);
                }
            }
        };
        fetchConfig();
    }, []);

    // Poll for Live Price via Supabase (Cache)
    // Live Price via Supabase Realtime
    useEffect(() => {
        const fetchPrice = async () => {
            const { data } = await supabase
                .from('strategy_stats')
                .select('value')
                .eq('key', 'ticker_BTCUSDC')
                .single();

            if (data?.value) {
                try {
                    const t = JSON.parse(data.value);
                    if (t.lastPrice) setCurrentPrice(parseFloat(t.lastPrice));
                } catch { }
            }
        };

        fetchPrice();

        const subscription = supabase
            .channel('settings-price')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'strategy_stats',
                filter: 'key=eq.ticker_BTCUSDC'
            }, (payload) => {
                if (payload.new && payload.new.value) {
                    try {
                        const val = payload.new.value;
                        const t = typeof val === 'string' ? JSON.parse(val) : val;
                        if (t.lastPrice) setCurrentPrice(parseFloat(t.lastPrice));
                    } catch { }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
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

            const { error } = await supabase
                .from('strategy_stats')
                .upsert({
                    key: 'bot_configuration',
                    value: JSON.stringify(payload)
                });

            if (!error) {
                console.log("Strategy updated to Supabase");
                setFullConfig(payload);
            } else {
                console.error("Failed to update strategy", error);
            }
        } catch (err) {
            console.error("Error applying strategy:", err);
        } finally {
            setIsApplyingStrategy(false);
        }
    };

    // Calculation Handlers
    const handleUpperPriceChange = (value) => {
        const val = parseFloat(value);
        setUpperPrice(val);
        if (!isNaN(val) && gridLevels && gridGap) {
            const calculatedLower = val - (parseInt(gridLevels) * parseFloat(gridGap));
            setLowerPrice(calculatedLower > 0 ? calculatedLower : 0);
        }
    };

    const handleLowerPriceChange = (value) => {
        const val = parseFloat(value);
        setLowerPrice(val);
        if (!isNaN(val) && gridLevels && gridGap) {
            const calculatedUpper = val + (parseInt(gridLevels) * parseFloat(gridGap));
            setUpperPrice(calculatedUpper);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', gap: '1.5rem', overflow: 'hidden' }} className="settings-container">

            {/* Main Center Area */}
            <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem' }} className="main-center-area">
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>System Configuration</h1>

                {/* Parameters + Visualization Row */}
                <div style={{ display: 'flex', gap: '1.5rem' }} className="params-vis-row">

                    {/* Strategy Parameters Section (Half Width) */}
                    <div style={{
                        flex: 1,
                        background: 'var(--bg-card)',
                        border: 'var(--glass-border)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        backdropFilter: 'var(--backdrop-blur)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Sliders size={20} color="#ff00e5" />
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Strategy Parameters</h3>
                            </div>
                            <button
                                onClick={handleApplyStrategyParams}
                                style={{
                                    background: isApplyingStrategy ? '#00cc6a' : '#00ff88',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.6rem 1.2rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    opacity: isApplyingStrategy ? 0.8 : 1,
                                    boxShadow: '0 4px 12px rgba(0, 255, 136, 0.2)'
                                }}>
                                {isApplyingStrategy ? <RefreshCw className="spin" size={16} /> : null}
                                Apply
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <StrategyField
                                label="Grid Levels"
                                tooltip="The total number of buy and sell positions the bot will open and manage."
                                value={gridLevels}
                                onChange={setGridLevels}
                                type="number"
                            />
                            <StrategyField
                                label="Quantity per Level"
                                tooltip="The specific amount of the asset to be traded at every individual price point."
                                value={quantity}
                                onChange={setQuantity}
                                type="number"
                                step="0.000001"
                            />
                            <StrategyField
                                label="Grid Gap"
                                tooltip="The price distance or percentage difference between each trade position."
                                value={gridGap}
                                onChange={setGridGap}
                                type="number"
                            />
                            <StrategyField
                                label="Upper Price Limit"
                                tooltip="The ceiling price; the bot will stop placing buy orders if the market price rises above this point."
                                value={upperPrice}
                                onChange={handleUpperPriceChange}
                                type="number"
                            />
                            <StrategyField
                                label="Lower Price Limit"
                                tooltip="The floor price; the bot will stop placing orders if the market price drops below this point."
                                value={lowerPrice}
                                onChange={handleLowerPriceChange}
                                type="number"
                            />
                        </div>
                    </div>

                    {/* Grid Visualization Section (Right Half) */}
                    <div style={{
                        flex: 1,
                        background: 'var(--bg-card)',
                        border: 'var(--glass-border)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        backdropFilter: 'var(--backdrop-blur)',
                        display: 'flex',
                        flexDirection: 'column'
                    }} className="strategy-vis-container">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Info size={20} color="#00d8ff" />
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Strategy Visualization</h3>
                        </div>

                        <GridVisualization
                            gridLevels={gridLevels}
                            upperPrice={upperPrice}
                            lowerPrice={lowerPrice}
                            currentPrice={currentPrice}
                        />
                    </div>
                </div>


                {/* Risk Management Section */}
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="risk-grid">
                        <FormInput label="Risk Per Trade (%)" value={riskPerTrade} onChange={setRiskPerTrade} type="number" step="0.1" />
                        <FormInput label="Stop Loss (%)" value={stopLoss} onChange={setStopLoss} type="number" step="0.1" />
                        <FormInput label="Take Profit (%)" value={takeProfit} onChange={setTakeProfit} type="number" step="0.1" />
                    </div>
                </div>

            </div>

            {/* Right Sidebar */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '300px' }} className="right-sidebar">

                {/* Bot Control Panel */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'var(--backdrop-blur)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                        <Zap size={20} color="#ffd700" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Service Control</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <button
                            onClick={() => supabase.from('bot_control').update({ command: 'START' }).eq('id', 1)}
                            style={{
                                background: 'rgba(0, 255, 136, 0.15)',
                                color: '#00ff88',
                                border: '1px solid rgba(0, 255, 136, 0.3)',
                                borderRadius: '8px',
                                padding: '0.8rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(0, 255, 136, 0.25)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(0, 255, 136, 0.15)'}
                        >
                            START
                        </button>
                        <button
                            onClick={() => supabase.from('bot_control').update({ command: 'STOP' }).eq('id', 1)}
                            style={{
                                background: 'rgba(255, 77, 77, 0.15)',
                                color: '#ff4d4d',
                                border: '1px solid rgba(255, 77, 77, 0.3)',
                                borderRadius: '8px',
                                padding: '0.8rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 77, 77, 0.25)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 77, 77, 0.15)'}
                        >
                            STOP
                        </button>
                    </div>
                    <button
                        onClick={() => supabase.from('bot_control').update({ command: 'RESTART' }).eq('id', 1)}
                        style={{
                            width: '100%',
                            background: 'rgba(255, 215, 0, 0.15)',
                            color: '#ffd700',
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                            borderRadius: '8px',
                            padding: '0.8rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.25)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.15)'}
                    >
                        <RefreshCw size={16} /> RESTART SERVICE
                    </button>
                </div>

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

                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                window.location.href = '/'; // Redirects to login via protected route logic
                            }}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                width: '100%', padding: '1rem',
                                background: 'rgba(255, 77, 77, 0.1)',
                                color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.2)', borderRadius: '8px',
                                fontWeight: '600', cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginTop: '1rem' // Visual separation
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 77, 77, 0.2)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 77, 77, 0.1)'}
                        >
                            <div style={{ transform: 'rotate(180deg)' }}><Terminal size={18} /></div>
                            Sign Out
                        </button>
                    </div>
                </div>

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

const GridVisualization = ({ gridLevels, upperPrice, lowerPrice, currentPrice }) => {
    // Basic validation
    const levels = parseInt(gridLevels) || 0;
    const upper = parseFloat(upperPrice) || 0;
    const lower = parseFloat(lowerPrice) || 0;
    const range = upper - lower;
    const cur = parseFloat(currentPrice) || 0;

    // Fallback if config invalid
    if (range <= 0 || levels <= 0) {
        return (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                Invalid Configuration
            </div>
        );
    }

    // Calculate Buy/Sell order split
    const step = range / levels;

    let buyOrders = 0;
    let sellOrders = 0;

    if (cur >= upper) {
        // Price above range -> All Buy Orders (Grid fully below)
        buyOrders = levels;
        sellOrders = 0;
    } else if (cur <= lower) {
        // Price below range -> All Sell Orders (Grid fully above)
        sellOrders = levels;
        buyOrders = 0;
    } else {
        // In range
        const priceAboveLower = cur - lower;
        buyOrders = Math.floor(priceAboveLower / step);
        sellOrders = levels - buyOrders;
    }

    // Dynamic Positioning Logic
    // We want to calculate the visually correct position for the "Current Price" line, 
    // but CLAMP it so it doesn't crush the Buy/Sell order boxes.

    // 0% is Bottom (Lower Price), 100% is Top (Upper Price)
    let rawPercent = ((cur - lower) / range) * 100;

    // Clamp limits for visualization only (keep visual padding)
    // We'll map the actual percent range (0-100) to a smaller visual range (e.g., 20%-80%)
    // This ensures there is always 20% space at top and bottom for the boxes.
    const VISUAL_MIN = 25; // 25% from bottom
    const VISUAL_MAX = 75; // 75% from bottom (leaving 25% at top)
    const VISUAL_RANGE = VISUAL_MAX - VISUAL_MIN;

    // Clamp input to 0-100 just in case
    const clampedInput = Math.max(0, Math.min(100, rawPercent));

    // Map to visual range
    const visualPercent = VISUAL_MIN + ((clampedInput / 100) * VISUAL_RANGE);

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            padding: '2rem 1.5rem',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            alignItems: 'center',
            justifyContent: 'center', // Changed back to center because we are using absolute/relative now effectively
            minHeight: '540px',
            position: 'relative', // Essential for absolute positioning
            isolation: 'isolate' // Creates a new stacking context
        }}>

            {/* --- VISUALIZATION CONTAINER --- */}
            {/* We use an inner container to manage the layout of lines relative to the full height */}
            <div style={{
                position: 'relative',
                width: '100%',
                flex: 1, // Changed from height: '100%' to flex: 1 to ensure it fills minHeight parent
                marginLeft: '10px'
            }}>

                {/* 0. VERTICAL CENTER LINE (Reference) - Added here */}
                {/* Positioned absolutely within the inner container, centered, behind everything */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderLeft: '1px dashed rgba(255,255,255,0.1)',
                    zIndex: -1 // Behind content
                }}></div>

                {/* 1. UPPER LIMIT (Top: 0) */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: '2px dashed #ff3c3c' }}>
                    <span style={{ position: 'absolute', right: 0, bottom: '5px', fontSize: '0.8rem', color: '#ff3c3c' }}>Upper: {upper.toFixed(2)}</span>
                </div>

                {/* 2. SELL ORDERS BOX (Floating in the top section) */}
                {/* Positioned visually between Top and Price Line */}
                <div style={{
                    position: 'absolute',
                    top: `${(100 - visualPercent) / 2}%`, // Roughly centered in the top gap
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                    background: '#1a1d21', // Solid background to cover line
                    border: '1px solid rgba(255, 60, 60, 0.4)',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    color: '#ffaaaa',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' // optional shadow
                }}>
                    Sell Orders x{sellOrders}
                </div>

                {/* 3. CURRENT PRICE LINE (Dynamic) */}
                <div style={{
                    position: 'absolute',
                    bottom: `${visualPercent}%`,
                    left: '-20px',
                    right: 0,
                    borderBottom: '2px dashed #fff',
                    transition: 'bottom 0.5s ease-out', // Smooth animation
                    zIndex: 2 // Above the vertical line
                }}>
                    <span style={{
                        position: 'absolute',
                        left: '50%',
                        top: '-12px',
                        transform: 'translate(-50%)',
                        background: 'var(--bg-card)',
                        padding: '0 10px',
                        fontSize: '0.9rem',
                        color: '#fff',
                        fontWeight: 'bold'
                    }}>
                        Price: {cur.toFixed(2)}
                    </span>
                </div>

                {/* 4. BUY ORDERS BOX (Floating in the bottom section) */}
                {/* Positioned visually between Price Line and Bottom */}
                <div style={{
                    position: 'absolute',
                    bottom: `${visualPercent / 2}%`, // Roughly centered in the bottom gap
                    left: '50%',
                    transform: 'translate(-50%, 50%)',
                    zIndex: 2,
                    background: '#16231b', // Solid background (dark green-ish) to cover line
                    border: '1px solid rgba(0, 255, 136, 0.4)',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    color: '#aaffcc',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    Buy Orders x{buyOrders}
                </div>

                {/* 5. LOWER LIMIT (Bottom: 0) */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderBottom: '2px dashed #00ff88' }}>
                    <span style={{ position: 'absolute', right: 0, top: '5px', fontSize: '0.8rem', color: '#00ff88' }}>Lower: {lower.toFixed(2)}</span>
                </div>

            </div>

        </div>
    );
};

// Component for a Single Strategy Field (Stacked Layout)
const StrategyField = ({ label, tooltip, value, onChange, type = "text", step }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {/* Header Row: Label + Tooltip Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: '500', color: '#fff' }}>{label}</label>
                <div
                    style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <Info size={14} color="var(--text-secondary)" style={{ cursor: 'help' }} />

                    {/* Tooltip Popup */}
                    {showTooltip && (
                        <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '-20px', // Anchor left
                            marginBottom: '10px',
                            background: '#222',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '0.6rem 0.8rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            color: '#e0e0e0',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            width: 'max-content',
                            maxWidth: '400px',
                            whiteSpace: 'normal',
                            textAlign: 'center'
                        }}>
                            {tooltip}
                            {/* Arrow */}
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: '27px', // Align arrow with icon
                                transform: 'translateX(-50%)',
                                borderWidth: '5px',
                                borderStyle: 'solid',
                                borderColor: '#222 transparent transparent transparent'
                            }}></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Field */}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                step={step}
                style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    marginTop: '0.25rem',
                    width: '100%',
                    boxSizing: 'border-box'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#00ff88')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
        </div>
    );
};

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

// CSS Injection
const style = document.createElement('style');
style.textContent = `
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }

  /* Hide number input arrows */
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
  input[type=number] {
    -moz-appearance: textfield;
  }
`;
document.head.appendChild(style);

export default Settings;
