'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { HeroBanner } from '@/components/home/HeroBanner';
import { StatsSection } from '@/components/home/StatsSection';
import { TrendingVideos } from '@/components/home/TrendingVideos';
import { TrendRadarSection } from '@/components/home/TrendRadarSection';
import { ViceAiClipperSection } from '@/components/home/ViceAiClipperSection';
import { CreatorStudioSection } from '@/components/home/CreatorStudioSection';
import { useApp } from '@/context/AppContext';
import { TRENDING_VIDEOS } from '@/data/mockData';

export default function DashboardPage() {
  const router = useRouter();
  const { openVideoModal, openUploadModal, searchGlobalQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Gameplay', 'Highlights', 'Easter Eggs', 'Trailer'];

  const filteredVideos = TRENDING_VIDEOS.filter((vid) => {
    const matchesSearch =
      vid.title.toLowerCase().includes(searchGlobalQuery.toLowerCase()) ||
      vid.creator.name.toLowerCase().includes(searchGlobalQuery.toLowerCase()) ||
      vid.tags.some((t) => t.toLowerCase().includes(searchGlobalQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'Todos' || vid.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleStatClick = (statId: string) => {
    if (statId === 'stat-1') {
      router.push('/app/trend-radar');
    } else if (statId === 'stat-4') {
      router.push('/app/criadores');
    } else {
      message.info('Filtrando estatísticas em tempo real...');
    }
  };

  return (
    <>
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_0_12px_rgba(255,20,147,0.4)]'
                : 'bg-[#151027] text-vice-textMuted border border-purple-500/20 hover:text-white hover:border-vice-pink/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4.3 Hero Banner */}
      <HeroBanner
        onExploreClick={() => router.push('/app/explorar')}
        onPlayFeaturedClip={() => openVideoModal(TRENDING_VIDEOS[0])}
      />

      {/* 4.4 Stats Cards (4 Cards) */}
      <StatsSection onStatClick={handleStatClick} />

      {/* 4.5 Seção Vídeos em Alta */}
      <TrendingVideos
        videos={filteredVideos}
        onSelectVideo={openVideoModal}
        onViewAll={() => router.push('/app/explorar')}
      />

      {/* Bottom Modules from Design Reference */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Module 1: Trend Radar */}
        <div className="xl:col-span-1">
          <TrendRadarSection
            onSelectTopic={(topic) => {
              router.push('/app/trend-radar');
            }}
          />
        </div>

        {/* Module 2: Vice AI Clipper */}
        <div className="xl:col-span-1">
          <ViceAiClipperSection onOpenUploader={openUploadModal} />
        </div>

        {/* Module 3: Creator Studio */}
        <div className="xl:col-span-1">
          <CreatorStudioSection
            onNewVideoClick={openUploadModal}
            onViewStudio={() => router.push('/app/criadores')}
            onSelectStudioVideo={() => openVideoModal(TRENDING_VIDEOS[3])}
          />
        </div>
      </div>
    </>
  );
}
