"use client";
/**
 * MetricStrip — three icon-tile cards on a cream band.
 *
 *   <MetricStrip
 *     metrics={[
 *       { icon: Award, stat: '12M+', label: 'Credentials issued' },
 *       { icon: Globe, stat: '45',   label: 'Countries served' },
 *       { icon: Zap,   stat: '387ms', label: 'p99 verify' },
 *     ]}
 *   />
 */
import React from 'react';

const TILES = ['#F0DAD2', '#E2D4F2', '#D8E5DA', '#FCE7B5'];

export const MetricStrip = ({ metrics, testId = 'metric-strip', className = '' }) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-3 gap-5 ${className}`}
    data-testid={testId}
  >
    {metrics.map((m, i) => {
      const Icon = m.icon;
      return (
        <div
          key={m.label}
          className="rounded-2xl p-6"
          style={{ background: '#FFFFFF', border: '1px solid #ECE7F1' }}
          data-testid={`${testId}-tile-${i}`}
        >
          {Icon && (
            <div
              className="w-11 h-11 mb-4 rounded-xl flex items-center justify-center"
              style={{ background: TILES[i % TILES.length] }}
            >
              <Icon className="w-5 h-5" style={{ color: '#0F0E1A' }} strokeWidth={1.8} />
            </div>
          )}
          <p className="text-3xl md:text-4xl font-bold leading-none tracking-tight cs-grad-text">
            {m.stat}
          </p>
          <p className="text-sm text-[#2E2A3D] mt-2 leading-snug">{m.label}</p>
        </div>
      );
    })}
  </div>
);

export default MetricStrip;
