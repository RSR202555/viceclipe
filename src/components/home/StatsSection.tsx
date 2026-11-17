'use client';

import React from 'react';
import { Card, Tooltip } from 'antd';
import { Flame, Eye, Radio, Trophy, ArrowUpRight } from 'lucide-react';
import { StatMetric } from '@/types';
import { STATS_DATA } from '@/data/mockData';

interface StatsSectionProps {
  stats?: StatMetric[];
  onStatClick?: (statId: string) => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  stats = STATS_DATA,
  onStatClick,
}) => {
  const getIcon = (iconName: StatMetric['iconName']) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-6 h-6 text-orange-400" />;
      case 'Eye':
        return <Eye className="w-6 h-6 text-vice-blue" />;
      case 'Radio':
        return <Radio className="w-6 h-6 text-vice-pink" />;
      case 'Trophy':
        return <Trophy className="w-6 h-6 text-amber-400" />;
    }
  };

  const getCardStyle = (glowColor: StatMetric['glowColor']) => {
    switch (glowColor) {
      case 'orange':
        return {
          glow: 'group-hover:shadow-[0_8px_30px_rgba(249,115,22,0.22)] group-hover:border-orange-500/40',
          iconBg: 'bg-orange-500/15 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.25)]',
          badgeClass: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
        };
      case 'cyan':
        return {
          glow: 'group-hover:shadow-[0_8px_30px_rgba(0,217,255,0.22)] group-hover:border-cyan-400/40',
          iconBg: 'bg-cyan-500/15 border-cyan-500/30 shadow-[0_0_15px_rgba(0,217,255,0.25)]',
          badgeClass: 'text-vice-blue bg-vice-blue/15 border-vice-blue/30',
        };
      case 'magenta':
        return {
          glow: 'group-hover:shadow-[0_8px_30px_rgba(255,20,147,0.22)] group-hover:border-pink-500/40',
          iconBg: 'bg-pink-500/15 border-pink-500/30 shadow-[0_0_15px_rgba(255,20,147,0.25)]',
          badgeClass: 'text-vice-pink bg-vice-pink/15 border-vice-pink/30',
        };
      case 'amber':
        return {
          glow: 'group-hover:shadow-[0_8px_30px_rgba(245,158,11,0.22)] group-hover:border-amber-400/40',
          iconBg: 'bg-amber-500/15 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
          badgeClass: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => {
        const style = getCardStyle(item.glowColor);
        return (
          <Tooltip key={item.id} title={item.tooltip} placement="top">
            <div
              onClick={() => onStatClick && onStatClick(item.id)}
              className={`group relative rounded-2xl bg-[#151027] border border-[rgba(139,46,255,0.2)] p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${style.glow}`}
            >
              <div className="flex items-center gap-4">
                {/* Glowing Icon Box */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 flex-shrink-0 ${style.iconBg}`}
                >
                  {getIcon(item.iconName)}
                </div>

                {/* Content */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-vice-textMuted tracking-wide uppercase truncate">
                    {item.title}
                  </span>

                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                      {item.value}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-vice-textMuted/80 whitespace-nowrap">
                      {item.unit}
                    </span>

                    {item.badge && item.badge.type === 'success' && (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30 whitespace-nowrap">
                        {item.badge.text}
                      </span>
                    )}

                    {item.badge && item.badge.type === 'live' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-vice-pink bg-vice-pink/15 px-1.5 py-0.2 rounded border border-vice-pink/30 animate-pulse whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-vice-pink" />
                        {item.badge.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};
