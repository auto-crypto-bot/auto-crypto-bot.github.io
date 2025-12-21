import React, { useState, useMemo } from 'react';
import PnLChart from '../components/PnLChart';
import { TrendingUp, TrendingDown, Calendar, Clock, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const Analytics = () => {
    const [pnlRange, setPnlRange] = useState('30D');
    const [hourlyRange, setHourlyRange] = useState('24H');

    // Mock Data Generator for PnL
    const pnlData = useMemo(() => {
        const data = [];
        const daysMap = { '1D': 1, '2D': 2, '5D': 5, '10D': 10, '15D': 15, '30D': 30, 'ALL': 180 };
        const days = daysMap[pnlRange];
        const now = new Date();

        let value = 1000;
        const pointsPerDay = pnlRange === '1D' ? 24 : 1;
        const totalPoints = days * pointsPerDay;

        for (let i = 0; i < totalPoints; i++) {
            const date = new Date(now);
            if (pnlRange === '1D') {
                date.setHours(now.getHours() - (totalPoints - i));
            } else {
                date.setDate(now.getDate() - (totalPoints - i));
            }

            value += (Math.random() - 0.45) * 50;

            data.push({
                time: pnlRange === '1D'
                    ? Math.floor(date.getTime() / 1000)
                    : date.toISOString().split('T')[0],
                value: value
            });
        }
        return data;
    }, [pnlRange]);

    // Derived PnL Stats
    const pnlStats = useMemo(() => {
        if (!pnlData.length) return { max: 0, min: 0, maxDate: '-', minDate: '-' };

        let maxVal = -Infinity;
        let minVal = Infinity;
        let maxDate = '';
        let minDate = '';

        pnlData.forEach(d => {
            if (d.value > maxVal) { maxVal = d.value; maxDate = d.time; }
            if (d.value < minVal) { minVal = d.value; minDate = d.time; }
        });

        const formatDate = (t) => {
            if (typeof t === 'number') { // Timestamp for 1D
                return new Date(t * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            return t; // Date string
        };

        return {
            max: maxVal.toFixed(2),
            min: minVal.toFixed(2),
            maxDate: formatDate(maxDate),
            minDate: formatDate(minDate)
        };
    }, [pnlData]);

    // Mock Data for Hourly Profit
    const hourlyProfitData = useMemo(() => {
        const hoursMap = { '10H': 10, '24H': 24, '48H': 48, '4D': 96 };
        const count = hoursMap[hourlyRange];
        const data = [];

        for (let i = 0; i < count; i++) {
            data.push({
                hour: i,
                value: Math.floor(Math.random() * 80) + 10,
            });
        }
        return data;
    }, [hourlyRange]);

    // Derived Hourly Stats
    const hourlyStats = useMemo(() => {
        if (!hourlyProfitData.length) return { maxHour: '-', maxVal: 0, minHour: '-', minVal: 0 };

        let maxVal = -Infinity;
        let minVal = Infinity;
        let maxHour = -1;
        let minHour = -1;

        hourlyProfitData.forEach(d => {
            if (d.value > maxVal) { maxVal = d.value; maxHour = d.hour; }
            if (d.value < minVal) { minVal = d.value; minHour = d.hour; }
        });

        return { maxHour, maxVal, minHour, minVal };
    }, [hourlyProfitData]);


    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden', paddingRight: '1rem' }}>

            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Analytics</h1>

            {/* SECTION 1: Cumulative PnL + Analysis */}
            <div style={{ flex: 1, display: 'flex', gap: '1.5rem', minHeight: '0' }}>

                {/* Chart Area (75%) */}
                <div style={{
                    flex: 3,
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'var(--backdrop-blur)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Cumulative PnL</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
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
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff88' }}>+$1,240.50</div>
                            <span style={{ fontSize: '0.8rem', color: '#00ff88' }}>+12.4%</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                        <PnLChart data={pnlData} color="#00ff88" />
                    </div>
                </div>

                {/* Analysis Box (25%) */}
                <div style={{
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
            <div style={{ flex: 1, display: 'flex', gap: '1.5rem', minHeight: '0' }}>

                {/* Chart Area (75%) */}
                <div style={{
                    flex: 3,
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'var(--backdrop-blur)',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Hourly Profit Distribution</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '2px', overflowX: 'auto', paddingBottom: '5px' }}>
                        {hourlyProfitData.map((item, i) => (
                            <div key={i} style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                height: '100%',
                                justifyContent: 'flex-end',
                                minWidth: hourlyRange === '4D' ? '6px' : '15px'
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: `${item.value}%`, // use value as % height
                                    maxHeight: '100%',
                                    background: item.hour === hourlyStats.maxHour ? '#00ff88' : 'rgba(0, 216, 255, 0.2)',
                                    borderRadius: '2px',
                                    borderTop: item.hour === hourlyStats.maxHour ? 'none' : '2px solid #00d8ff',
                                    transition: 'height 0.3s ease',
                                    position: 'relative'
                                }}
                                    title={`Hour ${item.hour}: ${item.value}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Analysis Box (25%) */}
                <div style={{
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
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>+{hourlyStats.maxVal}%</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hour #{hourlyStats.maxHour}</div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            <Clock size={20} />
                            <span style={{ fontWeight: '600' }}>Quiet Hour</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{hourlyStats.minVal}%</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hour #{hourlyStats.minHour}</div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Analytics;
