import React, { useState, useMemo, useEffect } from 'react';
import PnLChart from '../components/PnLChart';
import { Clock, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Analytics = () => {
    const [pnlRange, setPnlRange] = useState('30D');
    const [hourlyRange, setHourlyRange] = useState('24H');
    const [pnlData, setPnlData] = useState([]);
    const [hourlyProfitData, setHourlyProfitData] = useState([]);

    // Fetch PnL Data
    useEffect(() => {
        const fetchPnl = async () => {
            const now = Date.now() / 1000;
            let startTs = 0;
            switch (pnlRange) {
                case '1D': startTs = now - 86400; break;
                case '2D': startTs = now - 86400 * 2; break;
                case '5D': startTs = now - 86400 * 5; break;
                case '10D': startTs = now - 86400 * 10; break;
                case '15D': startTs = now - 86400 * 15; break;
                case '30D': startTs = now - 86400 * 30; break;
                default: startTs = 0;
            }

            const { data } = await supabase
                .from('completed_cycles')
                .select('close_time, profit')
                .gt('close_time', startTs)
                .order('close_time', { ascending: true });

            if (data) {
                let cumulative = 0;
                const formatted = data.map(d => {
                    cumulative += (d.profit || 0);
                    return {
                        time: d.close_time,
                        value: cumulative
                    };
                });
                setPnlData(formatted);
            }
        };

        fetchPnl();
        const interval = setInterval(fetchPnl, 10000); // 10s poll
        return () => clearInterval(interval);
    }, [pnlRange]);

    // Derived PnL Stats
    const pnlStats = useMemo(() => {
        if (!pnlData.length) return { max: 0, min: 0, maxDate: '-', minDate: '-' };

        let max = -Infinity;
        let min = Infinity;
        let maxDate = '-';
        let minDate = '-';

        pnlData.forEach(d => {
            if (d.value > max) {
                max = d.value;
                maxDate = new Date(d.time * 1000).toLocaleDateString();
            }
            if (d.value < min) {
                min = d.value;
                minDate = new Date(d.time * 1000).toLocaleDateString();
            }
        });

        // Handle case where no data processed (shouldn't happen if length > 0)
        if (max === -Infinity) max = 0;
        if (min === Infinity) min = 0;

        return {
            max: max.toFixed(2),
            min: min.toFixed(2),
            maxDate,
            minDate
        };
    }, [pnlData]);

    // Fetch Hourly Profit Data
    useEffect(() => {
        const fetchHourly = async () => {
            const now = Date.now() / 1000;
            let rangeHours = 24;
            switch (hourlyRange) {
                case '10H': rangeHours = 10; break;
                case '24H': rangeHours = 24; break;
                case '48H': rangeHours = 48; break;
                case '4D': rangeHours = 96; break;
            }
            const startTs = now - (rangeHours * 3600);

            const { data } = await supabase
                .from('completed_cycles')
                .select('close_time, profit')
                .gt('close_time', new Date(startTs * 1000).toISOString())
                .order('close_time', { ascending: true });

            if (data) {
                // Bucket into hours
                // Create buckets
                const buckets = new Array(rangeHours).fill(0).map(() => ({ value: 0, cycles: 0 }));

                data.forEach(d => {
                    // Calculate which bucket: (Timestamp - Start) / 3600
                    const diffHours = (d.close_time - startTs) / 3600;
                    const index = Math.floor(diffHours);
                    if (index >= 0 && index < rangeHours) {
                        buckets[index].value += (d.profit || 0);
                        buckets[index].cycles += 1;
                    }
                });

                // Format: array of { hour: index, value: profit, cycles: count }
                // Reverse needed? The UI logic seemed to reverse it map([...].reverse())
                // The buckets correspond to [Oldest ... Newest].
                // The UI code does `[...hourlyProfitData].reverse().map`.
                // So if we provide [0=Oldest, N=Newest], UI reverses to [0=Newest, N=Oldest].
                // But wait, the previous UI logic used `item.hour` as index?
                // `item.hour` passed from backend was 0..N?
                // Let's just output array of objects with value.

                const formatted = buckets.map((b, i) => ({
                    hour: i,
                    value: b.value,
                    cycles: b.cycles
                }));
                setHourlyProfitData(formatted);
            }
        };

        fetchHourly();
        const interval = setInterval(fetchHourly, 10000);
        return () => clearInterval(interval);
    }, [hourlyRange]);


    // Derived Hourly Stats
    const hourlyStats = useMemo(() => {
        if (!hourlyProfitData.length) return { maxHour: '-', maxVal: 0, minHour: '-', minVal: 0, maxRaw: 1 };

        let maxVal = -Infinity;
        let minVal = Infinity;
        let maxHour = -1;
        let minHour = -1;

        hourlyProfitData.forEach(d => {
            if (d.value > maxVal) { maxVal = d.value; maxHour = d.hour; }
            if (d.value < minVal) { minVal = d.value; minHour = d.hour; }
        });

        // Ensure maxVal is at least something to avoid divide by zero in chart height
        const maxRaw = maxVal > 0 ? maxVal : 1;

        return { maxHour, maxVal: maxVal.toFixed(2), minHour, minVal: minVal.toFixed(2), maxRaw };
    }, [hourlyProfitData]);


    return (
        <div className="analytics-container" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden', paddingRight: '1rem' }}>

            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Analytics</h1>

            {/* SECTION 1: Cumulative PnL + Analysis */}
            <div className="analytics-row" style={{ flex: 1, display: 'flex', gap: '1.5rem', minHeight: '0' }}>

                {/* Chart Area (75%) */}
                <div className="chart-card" style={{
                    flex: 3,
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'var(--backdrop-blur)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div className="analytics-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Cumulative PnL</h3>
                            <div className="range-controls" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {['1D', '2D', '5D', '10D', '15D', '30D', 'ALL'].map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setPnlRange(range)}
                                        style={{
                                            background: pnlRange === range ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
                                            color: pnlRange === range ? '#00ff88' : 'var(--text-secondary)',
                                            border: pnlRange === range ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid transparent',
                                            borderRadius: '6px',
                                            padding: '2px 8px',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {/* Current PnL Value (Last point) */}
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff88' }}>
                                ${pnlData.length > 0 ? pnlData[pnlData.length - 1].value.toFixed(2) : '0.00'}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#00ff88' }}>Total Profit</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                        <PnLChart data={pnlData} color="#00ff88" />
                    </div>
                </div>

                {/* Analysis Box (25%) */}
                <div className="stats-card" style={{
                    flex: 1,
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'var(--backdrop-blur)',
                    display: 'flex', flexDirection: 'column', gap: '1.5rem',
                    justifyContent: 'center'
                }}>
                    <div style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00ff88', marginBottom: '0.5rem' }}>
                            <ArrowUpCircle size={20} />
                            <span style={{ fontWeight: '600' }}>Highest PnL</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${pnlStats.max}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Recorded on {pnlStats.maxDate}</div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff4d4d', marginBottom: '0.5rem' }}>
                            <ArrowDownCircle size={20} />
                            <span style={{ fontWeight: '600' }}>Lowest PnL</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${pnlStats.min}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Recorded on {pnlStats.minDate}</div>
                    </div>
                </div>
            </div>


            {/* SECTION 2: Hourly Profit + Analysis */}
            <div className="analytics-row" style={{ flex: 1, display: 'flex', gap: '1.5rem', minHeight: '0' }}>

                {/* Chart Area (75%) */}
                <div className="chart-card" style={{
                    flex: 3,
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'var(--backdrop-blur)',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div className="analytics-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Hourly Profit Distribution</h3>
                        <div className="range-controls" style={{ display: 'flex', gap: '0.5rem' }}>
                            {['10H', '24H', '48H', '4D'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setHourlyRange(range)}
                                    style={{
                                        background: hourlyRange === range ? 'rgba(0, 216, 255, 0.2)' : 'transparent',
                                        color: hourlyRange === range ? '#00d8ff' : 'var(--text-secondary)',
                                        border: hourlyRange === range ? '1px solid rgba(0, 216, 255, 0.3)' : '1px solid transparent',
                                        borderRadius: '6px',
                                        padding: '2px 8px',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div
                        className="no-scrollbar"
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: '2px',
                            overflowX: 'auto',
                            paddingBottom: '35px', // Increased space for labels
                            position: 'relative',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}>
                        <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                        {[...hourlyProfitData].reverse().map((item, i) => {
                            // Time Calculation
                            // item.hour is index 0..N
                            // We need to know total window size to map back to time
                            const hoursMap = { '10H': 10, '24H': 24, '48H': 48, '4D': 96 };
                            const hoursLookback = hoursMap[hourlyRange] || 24;
                            const now = Date.now();
                            // Approximate start time: 
                            const startTime = now - (hoursLookback * 3600 * 1000);
                            // item.hour comes from backend as 0..N index
                            // But backend "hour" field is the index.
                            const barTime = new Date(startTime + (item.hour * 3600 * 1000));
                            const timeLabel = barTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const fullDate = barTime.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                            // Since reversed, index 0 is Current Hour (Newest)
                            const isCurrentHour = i === 0;
                            const isMax = item.hour === hourlyStats.maxHour;

                            // Show label every N bars to avoid clutter
                            const showLabel = (hourlyRange === '10H') || (i % 6 === 0) || isCurrentHour;

                            return (
                                <div key={i} style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    height: '100%',
                                    justifyContent: 'flex-end',
                                    minWidth: hourlyRange === '4D' ? '6px' : '20px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        width: '100%',
                                        height: `${(Math.max(0, item.value) / hourlyStats.maxRaw) * 100}%`,
                                        maxHeight: '100%',
                                        background: isCurrentHour
                                            ? 'linear-gradient(180deg, #00ff88 0%, rgba(0,255,136,0.2) 100%)'
                                            : (isMax ? 'rgba(0, 255, 136, 0.8)' : 'rgba(0, 216, 255, 0.2)'),
                                        borderRadius: '2px',
                                        // Highlight current hour with border/glow
                                        border: isCurrentHour ? '1px solid #fff' : (isMax ? 'none' : 'none'),
                                        borderTop: (!isCurrentHour && !isMax) ? '2px solid #00d8ff' : 'none',
                                        boxShadow: isCurrentHour ? '0 0 10px rgba(0,255,136,0.3)' : 'none',
                                        transition: 'height 0.3s ease',
                                        position: 'relative',
                                        cursor: 'help'
                                    }}
                                        title={`${fullDate}\nProfit: $${item.value?.toFixed(3)}\nCycles: ${item.cycles || 0}${isCurrentHour ? ' (Current)' : ''}`}
                                    />
                                    {/* X-Axis Labels */}
                                    {showLabel && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-25px',
                                            fontSize: '0.6rem',
                                            color: isCurrentHour ? '#00ff88' : 'var(--text-secondary)',
                                            whiteSpace: 'nowrap',
                                            transform: hourlyRange === '4D' || hourlyRange === '48H' ? 'rotate(-45deg)' : 'none',
                                            transformOrigin: 'top left',
                                            left: '50%'
                                        }}>
                                            {isCurrentHour ? 'NOW' : timeLabel}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Analysis Box (25%) */}
                <div className="stats-card" style={{
                    flex: 1,
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'var(--backdrop-blur)',
                    display: 'flex', flexDirection: 'column', gap: '1.5rem',
                    justifyContent: 'center'
                }}>
                    <div style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00d8ff', marginBottom: '0.5rem' }}>
                            <Clock size={20} />
                            <span style={{ fontWeight: '600' }}>Best Hour</span>
                        </div>
                        {/* Changed from % to $ */}
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>+${hourlyStats.maxVal}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hour #{hourlyStats.maxHour}</div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            <Clock size={20} />
                            <span style={{ fontWeight: '600' }}>Quiet Hour</span>
                        </div>
                        {/* Changed from % to $ */}
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${hourlyStats.minVal}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hour #{hourlyStats.minHour}</div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Analytics;
