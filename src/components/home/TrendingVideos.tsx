'use client';

import React from 'react';
import Image from 'next/image';
import { Card, Tooltip } from 'antd';
import { Flame, Play, CheckCircle2, ArrowRight, Eye, Clock } from 'lucide-react';
import { VideoClip } from '@/types';
import { TRENDING_VIDEOS } from '@/data/mockData';
import { RankingBadge } from '../ui/RankingBadge';

interface TrendingVideosProps {
  videos?: VideoClip[];
  onSelectVideo: (video: VideoClip) => void;
  onViewAll?: () => void;
}

export const TrendingVideos: React.FC<TrendingVideosProps> = ({
  videos = TRENDING_VIDEOS,
  onSelectVideo,
  onViewAll,
}) => {
  return (
    <section className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-vice-pink shadow-[0_0_12px_rgba(255,20,147,0.3)]">
            <Flame className="w-4 h-4 fill-vice-pink/30 text-vice-pink" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black italic tracking-wide text-white uppercase font-display">
            Vídeos em Alta
          </h3>
        </div>

        <button
          onClick={onViewAll}
          className="group flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-vice-textMuted hover:text-vice-pink transition-colors cursor-pointer"
        >
          <span>Ver Todos</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => onSelectVideo(video)}
            className="group relative flex flex-col rounded-2xl bg-[#151027] border border-[rgba(139,46,255,0.2)] hover:border-vice-pink/40 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(139,46,255,0.2)] cursor-pointer"
          >
            {/* Thumbnail Box */}
            <div className="relative w-full aspect-video sm:h-36 overflow-hidden bg-black/40">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#151027] via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity" />

              {/* Play Button Overlay on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-[2px]">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-vice-pink to-vice-purple text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,20,147,0.7)] transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

              {/* Ranking Badge Top-Left or Bottom-Left */}
              {video.ranking && (
                <div className="absolute top-2.5 left-2.5 z-10">
                  <RankingBadge rank={video.ranking} />
                </div>
              )}

              {/* Duration Badge Bottom-Right */}
              <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-bold text-white tracking-wider border border-white/10">
                {video.duration}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
              {/* Title */}
              <h4 className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-vice-pink transition-colors">
                {video.title}
              </h4>

              {/* Creator Info & Metadata */}
              <div className="flex flex-col gap-1.5 mt-auto pt-1 border-t border-[rgba(139,46,255,0.12)]">
                {/* Creator Row */}
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5 rounded-full overflow-hidden border border-purple-400/40 flex-shrink-0">
                    <Image
                      src={video.creator.avatar}
                      alt={video.creator.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <span className="text-xs font-semibold text-zinc-300 truncate">
                    {video.creator.name}
                  </span>

                  {video.creator.verified && (
                    <Tooltip title="Criador Verificado">
                      <CheckCircle2 className="w-3.5 h-3.5 text-vice-blue flex-shrink-0" />
                    </Tooltip>
                  )}
                </div>

                {/* Views & Time Ago Row */}
                <div className="flex items-center justify-between text-[11px] text-vice-textMuted">
                  <span>{video.views}</span>
                  <span className="text-zinc-500">•</span>
                  <span>{video.timeAgo}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
