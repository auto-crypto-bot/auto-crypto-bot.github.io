import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

const PnLChart = ({ data, color = '#2962FF' }) => {
    const chartContainerRef = useRef();
    const chartRef = useRef();

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#8b949e',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
        });

        // V4/V5 Syntax: use addAreaSeries
        const newSeries = chart.addAreaSeries({
            lineColor: color,
            topColor: color === '#00ff88' ? 'rgba(0, 255, 136, 0.4)' : color.replace(')', ', 0.5)').replace('rgb', 'rgba'),
            bottomColor: color === '#00ff88' ? 'rgba(0, 255, 136, 0.0)' : 'rgba(41, 98, 255, 0.05)',
            lineWidth: 2,
        });

        newSeries.setData(data);
        chart.timeScale().fitContent();

        chartRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
                chart.timeScale().fitContent();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, color]);

    return (
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    );
};

export default PnLChart;
