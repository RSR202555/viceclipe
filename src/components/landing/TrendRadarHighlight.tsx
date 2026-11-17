'use client';

import React from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ArrowUpRight, Sparkles, Flame, ArrowRight, Eye, Radio } from 'lucide-react';
import { CHART_DATA_BY_FILTER, TREND_TOPICS } from '@/data/mockData';

export const TrendRadarHighlight: React.FC = () => {
  const chartData = CHART_DATA_BY_FILTER['24h'];

  return (
    <section id="trend-radar" className="py-24 px-4 sm:px-6 lg:px-8 relative select-none bg-[#070611]">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Inteligência de Tendências</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black italic uppercase font-display text-white tracking-tight leading-tight mb-4">
            NÃO PERCA NENHUMA{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vice-pink to-vice-purple">
              TENDÊNCIA.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-vice-textMuted">
            Descubra quais assuntos, vídeos e criadores estão ganhando destaque no universo GTA 6 em tempo real.
          </p>
        </div>

        {/* Mockup Container */}
        <div className="w-full max-w-5xl rounded-3xl bg-[#151027] border border-[rgba(139,46,255,0.3)] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(16,185,129,0.15)] flex flex-col gap-6">
          {/* Top Bar of the Mockup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-purple-500/20 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <span>Leonida Trend Radar</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <p className="text-xs text-vice-textMuted">Índice algorítmico demonstrativo de engajamento</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                Últimas 24h
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30">
                +342% Vol. Total
              </span>
            </div>
          </div>

          {/* Grid: Left Top Topics + Right Interactive Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left: Ranking */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-wider px-1">
                <span>Assuntos em Alta</span>
                <span>Crescimento</span>
              </div>

              {TREND_TOPICS.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#100B1D]/80 hover:bg-[#1A1230] border border-purple-500/15 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-black/50 text-vice-blue text-xs font-black flex items-center justify-center border border-white/10">
                      {item.rank}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                        {item.topic}
                      </p>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Categoria: {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{item.growth}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Chart */}
            <div className="flex flex-col justify-between h-full bg-[#100B1D]/60 p-5 rounded-2xl border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-zinc-400 uppercase font-semibold">
                    Volume de reproduções
                  </span>
                  <div className="text-2xl font-black text-white font-display flex items-center gap-1.5">
                    <span>2.8M Views</span>
                    <Sparkles className="w-4 h-4 text-vice-pink" />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Pico diário</span>
                  <p className="text-xs font-mono text-zinc-300">20h — 23h</p>
                </div>
              </div>

              {/* Chart Component */}
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="landingTrendGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#8B2EFF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      stroke="#7E7694"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(139, 46, 255, 0.2)' }}
                    />
                    <YAxis hide domain={['dataMin - 10', 'dataMax + 20']} />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#1C1438] border border-cyan-400/40 p-2.5 rounded-xl shadow-lg text-xs">
                              <p className="text-white font-bold">{payload[0].payload.label}</p>
                              <p className="text-vice-blue font-semibold">
                                Crescimento: +{payload[0].value}%
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
                      stroke="#00D9FF"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#landingTrendGlow)"
                      dot={{ r: 4, fill: '#FF1493', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                      activeDot={{ r: 6, fill: '#00D9FF', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[10px] text-zinc-500 text-center mt-3">
                * Dados demonstrativos simulando o algoritmo de tendências de Leonida.
              </p>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="flex justify-center pt-3 border-t border-purple-500/15">
            <Link
              href="/app/trend-radar"
              className="px-8 py-3.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple hover:opacity-95 shadow-[0_0_20px_rgba(255,20,147,0.4)] flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>EXPLORAR TREND RADAR NO APP</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
