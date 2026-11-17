import React from 'react';

interface RankingBadgeProps {
  rank: number;
}

export const RankingBadge: React.FC<RankingBadgeProps> = ({ rank }) => {
  const getBadgeStyle = () => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-amber-400 to-orange-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)] border-amber-300';
      case 2:
        return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-[0_0_12px_rgba(217,70,239,0.4)] border-purple-400';
      case 3:
        return 'bg-gradient-to-br from-cyan-400 to-blue-600 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)] border-cyan-300';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div
      className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs border ${getBadgeStyle()}`}
    >
      {rank}
    </div>
  );
};
