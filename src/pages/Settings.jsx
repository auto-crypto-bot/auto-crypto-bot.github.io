import React from 'react';
import { Save, Download, Terminal, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../hooks/useSettings';

import StrategyParametersForm from '../features/settings/StrategyParametersForm';
import StrategyVisualization from '../features/settings/StrategyVisualization';
import RiskManagementForm from '../features/settings/RiskManagementForm';
import ServiceControlPanel from '../features/settings/ServiceControlPanel';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</span>
        <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{value}</span>
    </div>
);

const Settings = () => {
    const {
        gridLevels, setGridLevels,
        quantity, setQuantity,
        gridGap, setGridGap,
        upperPrice, handleUpperPriceChange,
        lowerPrice, handleLowerPriceChange,
        riskPerTrade, setRiskPerTrade,
        stopLoss, setStopLoss,
        takeProfit, setTakeProfit,
        isSaving, handleSave,
        isApplyingStrategy, handleApplyStrategyParams,
        currentPrice
    } = useSettings();



    return (
        <div style={{ height: '100%', display: 'flex', gap: '1.5rem', overflow: 'hidden' }} className="settings-container">

            {/* Main Center Area */}
            <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem' }} className="main-center-area">
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>System Configuration</h1>

                {/* Parameters + Visualization Row */}
                <div style={{ display: 'flex', gap: '1.5rem' }} className="params-vis-row">
                    <StrategyParametersForm
                        gridLevels={gridLevels} setGridLevels={setGridLevels}
                        quantity={quantity} setQuantity={setQuantity}
                        gridGap={gridGap} setGridGap={setGridGap}
                        upperPrice={upperPrice} handleUpperPriceChange={handleUpperPriceChange}
                        lowerPrice={lowerPrice} handleLowerPriceChange={handleLowerPriceChange}
                        isApplying={isApplyingStrategy}
                        onApply={handleApplyStrategyParams}
                    />

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

                        <StrategyVisualization
                            gridLevels={gridLevels}
                            upperPrice={upperPrice}
                            lowerPrice={lowerPrice}
                            currentPrice={currentPrice}
                        />
                    </div>
                </div>

                <RiskManagementForm
                    riskPerTrade={riskPerTrade} setRiskPerTrade={setRiskPerTrade}
                    stopLoss={stopLoss} setStopLoss={setStopLoss}
                    takeProfit={takeProfit} setTakeProfit={setTakeProfit}
                />
            </div>

            {/* Right Sidebar */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '300px' }} className="right-sidebar">

                <ServiceControlPanel />

                <Card>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            loading={isSaving}
                            icon={<Save size={18} />}
                        >
                            Save Configuration
                        </Button>

                        <Button
                            variant="secondary"
                            icon={<Download size={18} color="var(--text-secondary)" />}
                        >
                            Export Logs
                        </Button>

                        <div style={{ marginTop: '1rem' }}>
                            <Button
                                variant="danger"
                                icon={<div style={{ transform: 'rotate(180deg)' }}><Terminal size={18} /></div>}
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    window.location.href = '/';
                                }}
                            >
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                </Card>
            </div>
        </div>
    );
};

export default Settings;
