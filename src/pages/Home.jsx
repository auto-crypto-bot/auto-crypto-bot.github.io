import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import DashboardHeader from '../features/dashboard/DashboardHeader';
import SummaryGrid from '../features/dashboard/SummaryGrid';
import AssetAllocationChart from '../features/dashboard/AssetAllocationChart';
import SystemHealthList from '../features/dashboard/SystemHealthList';
import Button from '../components/ui/Button'; // Assuming we want to use our new Button for actions
import { useDashboardStats } from '../hooks/useDashboardStats';

const Home = () => {
    const {
        portfolioValue,
        balances,
        ticker,
        positionsInfo,
        stats,
        realtimeStatus,
        systemHealth,
        systemLogs
    } = useDashboardStats();

    // Data (Hardcoded as requested in original)
    const initialInvestment = 50.95;
    const investmentDate = "Dec 14, 2025";
    const apiLatency = "24ms"; // Keep mock for now

    // Temporary ActionButton (should be replaced by shared Button or similar)
    const ActionButton = ({ icon, label, color }) => (
        <Button
            style={{
                flex: 1,
                background: `rgba(${color === '#00ff88' ? '0, 255, 136' : '255, 77, 77'}, 0.1)`,
                color: color,
                border: `1px solid rgba(${color === '#00ff88' ? '0, 255, 136' : '255, 77, 77'}, 0.2)`,
            }}
            icon={icon}
            onMouseEnter={(e) => e.target.style.background = `rgba(${color === '#00ff88' ? '0, 255, 136' : '255, 77, 77'}, 0.2)`}
            onMouseLeave={(e) => e.target.style.background = `rgba(${color === '#00ff88' ? '0, 255, 136' : '255, 77, 77'}, 0.1)`}
        >
            {label}
        </Button>
    );

    return (
        <div style={{ height: '100%', display: 'flex', gap: '1.5rem', overflow: 'hidden' }} className="dashboard-container">

            {/* Main Content - 75% */}
            <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }} className="main-content">

                <DashboardHeader realtimeStatus={realtimeStatus} />

                <SummaryGrid
                    portfolioValue={portfolioValue}
                    initialInvestment={initialInvestment}
                    investmentDate={investmentDate}
                    positionsInfo={positionsInfo}
                    stats={stats}
                />

                <AssetAllocationChart balances={balances} ticker={ticker} />

            </div>

            {/* Right Sidebar - 25% */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '300px' }} className="right-sidebar">

                {/* Quick Actions (Disabled) */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'var(--backdrop-blur)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Quick Actions</h3>
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'var(--text-secondary)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>Coming Soon</span>
                    </div>

                    {/* Disabled Content */}
                    <div style={{ display: 'flex', gap: '1rem', opacity: 0.3, pointerEvents: 'none', filter: 'grayscale(0.8)' }}>
                        <ActionButton icon={<ArrowDownLeft size={20} />} label="Deposit" color="#00ff88" />
                        <ActionButton icon={<ArrowUpRight size={20} />} label="Withdraw" color="#ff4d4d" />
                    </div>
                </div>

                <SystemHealthList health={systemHealth} logs={systemLogs} apiLatency={apiLatency} />

            </div>
        </div>
    );
};

export default Home;
