import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

const PnLChart = ({ data, color = '#2962FF' }) => {
    const chartContainerRef = useRef();
    const chartRef = useRef(null);
    const seriesRef = useRef(null);

    // 1. Initialize Chart (Once)
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
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
        });

        const series = chart.addAreaSeries({
            lineColor: color,
            topColor: color === '#00ff88' ? 'rgba(0, 255, 136, 0.4)' : 'rgba(41, 98, 255, 0.4)',
            bottomColor: color === '#00ff88' ? 'rgba(0, 255, 136, 0.0)' : 'rgba(41, 98, 255, 0.05)',
            lineWidth: 2,
        });

        chartRef.current = chart;
        seriesRef.current = series;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
                try {
                    chartRef.current.timeScale().fitContent();
                } catch (e) { /* ignore disposal errors during resize */ }
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [color]); // Re-initialize if color changes

    // 2. Update Data (When data/color changes)
    useEffect(() => {
        if (seriesRef.current && data) {
            seriesRef.current.setData(data);
            if (chartRef.current) {
                chartRef.current.timeScale().fitContent();
            }
        }
        // Update colors if needed
        if (seriesRef.current) {
            seriesRef.current.applyOptions({
                lineColor: color,
                topColor: color === '#00ff88' ? 'rgba(0, 255, 136, 0.4)' : 'rgba(41, 98, 255, 0.4)',
                bottomColor: color === '#00ff88' ? 'rgba(0, 255, 136, 0.0)' : 'rgba(41, 98, 255, 0.05)',
            })
        }
    }, [data, color]);

    return (
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    );
};

export default PnLChart;
