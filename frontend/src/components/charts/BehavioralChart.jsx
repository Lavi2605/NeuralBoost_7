import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const BehavioralChart = forwardRef(({ data, onBarClick }, ref) => {
  const chartRef = useRef(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  useImperativeHandle(ref, () => ({
    getEchartsInstance: () => chartRef.current?.getEchartsInstance()
  }));
  
  const chartData = data.map(d => ({
    name: d.name,
    value: d.clickedPct,
    riskLevel: d.clickedPct > 50 ? 'High' : d.clickedPct > 25 ? 'Medium' : 'Low'
  }));
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '15%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: false
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#9aa7bf',
        fontSize: 11,
        formatter: '{value}%'
      },
      splitLine: {
        lineStyle: {
          color: '#1e2a44',
          type: 'dashed',
          opacity: 0.5
        }
      }
    },
    yAxis: {
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
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
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
            <div style="color: #f59e0b;">Clicked: ${param.value}%</div>
            <div style="color: #9aa7bf; font-size: 11px;">Risk Level: ${dataPoint.riskLevel}</div>
          </div>
        `;
      }
    },
    series: [
      {
        name: 'Clicked',
        type: 'bar',
        data: chartData.map((d, idx) => ({
          value: d.value,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#f59e0b' },
                { offset: 1, color: '#fb923c' }
              ]
            },
            borderRadius: [0, 8, 8, 0]
          }
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: '#e2e8f0',
          fontSize: 11
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(245, 158, 11, 0.5)'
          }
        }
      }
    ],
    animation: !prefersReducedMotion,
    animationDuration: prefersReducedMotion ? 0 : 1200,
    animationDelay: (idx) => prefersReducedMotion ? 0 : idx * 100,
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
          if (onBarClick) {
            onBarClick(params.name);
          }
        }
      }}
    />
  );
});

BehavioralChart.displayName = 'BehavioralChart';

export default BehavioralChart;

