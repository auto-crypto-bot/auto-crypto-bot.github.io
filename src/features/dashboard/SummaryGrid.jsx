import React from 'react';
import SummaryCard from './SummaryCard';
import { Wallet, Activity, Clock, TrendingUp, Calendar, Layers } from 'lucide-react';

const SummaryGrid = ({ portfolioValue, initialInvestment, investmentDate, positionsInfo, stats }) => {

    const formatRuntime = (seconds) => {
        if (!seconds) return "0m";
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);

        let parts = [];
        if (d > 0) parts.push(`${d}d`);
        if (h > 0) parts.push(`${h}h`);
        parts.push(`${m}m`);
        return parts.join(' ');
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="summary-grid">
            <SummaryCard
                label="Total Balance"
                value={`$${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subValue="BTC + USDC"
                icon={<Wallet size={24} color="#ffffff" />}
            />
            <SummaryCard
                label="Initial Investment"
                value={`$${initialInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subValue={`Started: ${investmentDate}`}
                icon={<Calendar size={24} color="#ffffff" />}
            />
            <SummaryCard
                label="Positions"
                value={`${positionsInfo.active} / ${positionsInfo.max}`}
                subValue="Active / Max"
                icon={<Layers size={24} color="#ffffff" />}
            />
            <SummaryCard
                label="Total Profit"
                value={`${stats.total_pl >= 0 ? '+' : ''}$${stats.total_pl.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`}
                subValue="All Time"
                icon={<Activity size={24} color="#00ff88" />}
            />
            <SummaryCard
                label="Active Runtime"
                value={formatRuntime(stats.runtime_seconds)}
                subValue="Since last reboot"
                icon={<Clock size={24} color="#00d8ff" />}
            />
            <SummaryCard
                label="Last 24H Profit"
                value={`${stats.profit_24h >= 0 ? '+' : ''}$${stats.profit_24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subValue={`${stats.cycles_24h} cycles 24h`}
                icon={<TrendingUp size={24} color="#ff00e5" />}
            />
        </div>
    );
};

export default SummaryGrid;
