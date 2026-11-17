'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ArrowUpRight, Flame, Sparkles } from 'lucide-react';
import { TimeFilter } from '@/types';
import { TREND_TOPICS, CHART_DATA_BY_FILTER } from '@/data/mockData';

interface TrendRadarSectionProps {
  onSelectTopic?: (topic: string) => void;
}

export const TrendRadarSection: React.FC<TrendRadarSectionProps> = ({
  onSelectTopic,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('24h');

  const filterOptions: { id: TimeFilter; label: string }[] = [
    { id: '24h', label: '24h' },
    { id: '7dias', label: '7 dias' },
    { id: '30dias', label: '30 dias' },
    { id: 'todos', label: 'Todos' },
  ];

  const currentChartData = CHART_DATA_BY_FILTER[selectedFilter] || CHART_DATA_BY_FILTER['24h'];

  return (
    <div className="relative rounded-2xl bg-[#151027] border border-[rgba(139,46,255,0.22)] p-5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.45)] overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[rgba(139,46,255,0.15)] gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-vice-pink shadow-[0_0_12px_rgba(255,20,147,0.3)] flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-vice-pink" />
          </div>
          <div>
            <h4 className="text-white font-bold text-base leading-tight tracking-wide flex items-center gap-1.5">
              <span>Trend Radar</span>
              <span className="w-2 h-2 rounded-full bg-vice-pink animate-ping" />
            </h4>
            <p className="text-[11px] text-vice-textMuted">Descubra o que está bombando em GTA 6</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-[#0C071C] p-1 rounded-xl border border-[rgba(139,46,255,0.18)] gap-1 flex-shrink-0 self-start sm:self-auto">
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_0_10px_rgba(255,20,147,0.4)]'
                  : 'text-vice-textMuted hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body: Left Ranking List + Right Interactive Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
        {/* Left: Top 5 Ranking */}
        <div className="flex flex-col gap-2">
          {TREND_TOPICS.map((item) => (
            <div
              key={item.rank}
              onClick={() => onSelectTopic && onSelectTopic(item.topic)}
              className="group flex items-center justify-between p-2 rounded-xl bg-[#100B1D]/60 hover:bg-[#1C1438] border border-[rgba(139,46,255,0.12)] hover:border-vice-pink/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-black text-vice-blue">
                  {item.rank}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  {item.topic}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <ArrowUpRight className="w-3 h-3" />
                <span>{item.growth}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Growth Chart */}
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[11px] text-vice-textMuted uppercase font-semibold">
                Crescimento de visualizações
              </span>
              <div className="text-2xl font-black text-emerald-400 font-display flex items-center gap-1">
                <span>+342%</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <span className="text-[10px] text-vice-textMuted bg-white/5 px-2 py-0.5 rounded border border-white/10">
              Leonida Hub Index
            </span>
          </div>

          <div className="w-full h-36 min-h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData}>
                <defs>
                  <linearGradient id="viceTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF1493" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#8B2EFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  stroke="#7E7694"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(139, 46, 255, 0.2)' }}
                />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 20']} />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#1C1438] border border-vice-pink/40 p-2 rounded-xl shadow-lg text-xs">
                          <p className="text-white font-bold">{payload[0].payload.label}</p>
                          <p className="text-vice-pink font-semibold">
                            Taxa: +{payload[0].value}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="growth"
                  stroke="#FF1493"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#viceTrendGradient)"
                  dot={{ r: 3, fill: '#00D9FF', strokeWidth: 1, stroke: '#FFFFFF' }}
                  activeDot={{ r: 5, fill: '#FF1493', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
