import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const MonthlyThreatsChart = forwardRef(({ data, timeframe = '30d' }, ref) => {
  const chartRef = useRef(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  useImperativeHandle(ref, () => ({
    getEchartsInstance: () => chartRef.current?.getEchartsInstance()
  }));
  
  // Transform data for ECharts
  const chartData = data.map((d, idx) => {
    const prevValue = idx > 0 ? data[idx - 1].threats : d.threats;
    const change = prevValue !== 0 ? ((d.threats - prevValue) / prevValue * 100).toFixed(1) : 0;
    return {
      name: d.name,
      value: d.threats,
      change: change > 0 ? `+${change}%` : `${change}%`
    };
  });
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.name),
      axisLine: {
        lineStyle: { color: '#1e2a44' }
      },
      axisLabel: {
        color: '#9aa7bf',
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#9aa7bf',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: '#1e2a44',
          type: 'dashed',
          opacity: 0.5
        }
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 22, 41, 0.95)',
      borderColor: '#1e2a44',
      borderWidth: 1,
      textStyle: {
        color: '#e2e8f0'
      },
      formatter: (params) => {
        const param = params[0];
        const dataPoint = chartData[param.dataIndex];
        return `
          <div style="padding: 4px 0;">
            <div style="font-weight: 600; margin-bottom: 4px;">${param.name}</div>
            <div style="color: #8b5cf6;">Threats: ${param.value}</div>
            <div style="color: #9aa7bf; font-size: 11px;">Change: ${dataPoint.change}</div>
          </div>
        `;
      }
    },
    series: [
      {
        name: 'Threats',
        type: 'line',
        data: chartData.map(d => d.value),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#8b5cf6' },
              { offset: 1, color: '#a78bfa' }
            ]
          }
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
              { offset: 1, color: 'rgba(139, 92, 246, 0)' }
            ]
          }
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#8b5cf6',
            shadowBlur: 10,
            shadowColor: 'rgba(139, 92, 246, 0.5)'
          }
        }
      }
    ],
    animation: !prefersReducedMotion,
    animationDuration: prefersReducedMotion ? 0 : 1200,
    animationEasing: 'cubicOut'
  };
  
  return (
    <ReactECharts
      ref={chartRef}
      option={option}
      style={{ height: '280px', width: '100%' }}
      opts={{ renderer: 'svg' }}
      onEvents={{
        click: (params) => {
          // Emit event for drill-down if needed
          console.log('Chart clicked:', params);
        }
      }}
    />
  );
});

MonthlyThreatsChart.displayName = 'MonthlyThreatsChart';

export default MonthlyThreatsChart;

