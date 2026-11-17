'use client';

import React from 'react';
import { Users, Crown, ArrowRight } from 'lucide-react';
import { CreatorStudioSection } from '@/components/home/CreatorStudioSection';
import { TrendingVideos } from '@/components/home/TrendingVideos';
import { useApp } from '@/context/AppContext';
import { TRENDING_VIDEOS } from '@/data/mockData';

export default function CriadoresPage() {
  const { openVideoModal, openUploadModal } = useApp();

  return (
    <div className="flex flex-col gap-6 select-none">
      <div className="pb-4 border-b border-purple-500/15">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Crown className="w-3.5 h-3.5" />
          <span>Comunidade & Parceiros</span>
        </div>
        <h1 className="text-3xl font-black italic uppercase font-display text-white">
          Criadores & Creator Studio
        </h1>
        <p className="text-sm text-vice-textMuted max-w-2xl">
          Acompanhe suas estatísticas de alcance, gerencie publicações e conecte-se com outros criadores de conteúdo do universo GTA 6.
        </p>
      </div>

      <CreatorStudioSection
        onNewVideoClick={openUploadModal}
        onSelectStudioVideo={() => openVideoModal(TRENDING_VIDEOS[0])}
      />

      <div className="mt-4">
        <TrendingVideos
          videos={TRENDING_VIDEOS}
          onSelectVideo={openVideoModal}
        />
      </div>
    </div>
  );
}
