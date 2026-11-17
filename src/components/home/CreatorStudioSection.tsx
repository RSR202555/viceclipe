'use client';

import React from 'react';
import Image from 'next/image';
import { Crown, CheckCircle2, ArrowRight, Plus, Eye, Heart, Users, Video } from 'lucide-react';
import { FEATURED_CREATOR, CREATOR_STUDIO_VIDEOS } from '@/data/mockData';

interface CreatorStudioSectionProps {
  onNewVideoClick?: () => void;
  onViewStudio?: () => void;
  onSelectStudioVideo?: (videoId: string) => void;
}

export const CreatorStudioSection: React.FC<CreatorStudioSectionProps> = ({
  onNewVideoClick,
  onViewStudio,
  onSelectStudioVideo,
}) => {
  return (
    <div className="relative rounded-2xl bg-[#151027] border border-[rgba(139,46,255,0.22)] p-5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.45)] overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(139,46,255,0.15)] mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h4 className="text-white font-bold text-base leading-tight tracking-wide">
              Creator Studio
            </h4>
            <p className="text-[11px] text-vice-textMuted">
              Gerencie seu conteúdo e acompanhe seu crescimento
            </p>
          </div>
        </div>

        {/* Action Button: Novo Vídeo */}
        <button
          onClick={onNewVideoClick}
          className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple hover:opacity-95 shadow-[0_0_12px_rgba(255,20,147,0.35)] flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
        >
          <span>Novo Vídeo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content: Creator Profile & Metrics */}
      <div className="flex flex-col gap-4">
        {/* Profile Card */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#100B1D]/80 border border-[rgba(139,46,255,0.15)]">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-purple-400/40 shadow-[0_0_12px_rgba(139,46,255,0.3)]">
              <Image
                src={FEATURED_CREATOR.avatar}
                alt={FEATURED_CREATOR.name}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-wide">
                  {FEATURED_CREATOR.name}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-vice-blue" />
              </div>
              <span className="text-[11px] text-vice-textMuted">
                {FEATURED_CREATOR.role}
              </span>
            </div>
          </div>

          {/* Metrics Column / Row */}
          <div className="flex items-center gap-4 sm:gap-6 text-center">
            <div>
              <p className="text-sm sm:text-base font-black text-white font-display">
                {FEATURED_CREATOR.totalViews}
              </p>
              <p className="text-[10px] text-vice-textMuted uppercase">Visualizações</p>
            </div>
            <div>
              <p className="text-sm sm:text-base font-black text-white font-display">
                {FEATURED_CREATOR.likes}
              </p>
              <p className="text-[10px] text-vice-textMuted uppercase">Curtidas</p>
            </div>
            <div>
              <p className="text-sm sm:text-base font-black text-white font-display">
                {FEATURED_CREATOR.followers}
              </p>
              <p className="text-[10px] text-vice-textMuted uppercase">Seguidores</p>
            </div>
          </div>
        </div>

        {/* "Seus Vídeos" Gallery */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-300 uppercase tracking-wide text-[11px]">
              Seus Vídeos Recentes
            </span>
            <button
              onClick={onViewStudio}
              className="text-vice-blue hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold"
            >
              <span>Ver Todos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {CREATOR_STUDIO_VIDEOS.map((vid) => (
              <div
                key={vid.id}
                onClick={() => onSelectStudioVideo && onSelectStudioVideo(vid.id)}
                className="group relative rounded-xl overflow-hidden aspect-video border border-[rgba(139,46,255,0.2)] hover:border-vice-pink/50 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              >
                <Image
                  src={vid.thumbnail}
                  alt={vid.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-[9px] font-mono text-zinc-300">
                  {vid.duration}
                </div>
                <div className="absolute bottom-1 left-1.5 text-[9px] text-white font-semibold truncate max-w-[80%]">
                  {vid.views}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
