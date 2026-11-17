'use client';

import React, { useState } from 'react';
import { Input, Tag } from 'antd';
import { Search, Filter, Compass, Flame, ArrowUpRight } from 'lucide-react';
import { TrendingVideos } from '@/components/home/TrendingVideos';
import { useApp } from '@/context/AppContext';
import { TRENDING_VIDEOS } from '@/data/mockData';

export default function ExplorarPage() {
  const { openVideoModal } = useApp();
  const [selectedTag, setSelectedTag] = useState<string>('Todos');
  const [localSearch, setLocalSearch] = useState<string>('');

  const tags = ['Todos', 'Gameplay', 'Highlights', 'Easter Eggs', 'Trailer', 'Vice City', 'Leonida'];

  const filtered = TRENDING_VIDEOS.filter((vid) => {
    const matchesTag =
      selectedTag === 'Todos' ||
      vid.category === selectedTag ||
      vid.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase()));

    const matchesSearch =
      vid.title.toLowerCase().includes(localSearch.toLowerCase()) ||
      vid.creator.name.toLowerCase().includes(localSearch.toLowerCase());

    return matchesTag && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-purple-500/15 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-vice-blue text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Descoberta Global</span>
          </div>
          <h1 className="text-3xl font-black italic uppercase font-display text-white">
            Explorar Leonida
          </h1>
          <p className="text-sm text-vice-textMuted">
            Navegue pelos momentos mais virais gravados pelos jogadores no mapa de Leonida e Vice City.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Pesquisar em Explorar..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            prefix={<Search className="w-4 h-4 text-vice-textMuted mr-1.5" />}
            allowClear
            className="rounded-full bg-[#100B1D] border-purple-500/25"
          />
        </div>
      </div>

      {/* Tags Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedTag === tag
                ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_0_12px_rgba(255,20,147,0.4)]'
                : 'bg-[#151027] text-vice-textMuted border border-purple-500/20 hover:text-white hover:border-vice-pink/40'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <TrendingVideos
        videos={filtered}
        onSelectVideo={openVideoModal}
      />
    </div>
  );
}
