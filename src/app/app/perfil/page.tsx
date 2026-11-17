'use client';

import React from 'react';
import Image from 'next/image';
import { User, ShieldCheck, Heart, Eye, Bookmark, Settings, Award } from 'lucide-react';
import { CURRENT_USER, CREATOR_STUDIO_VIDEOS } from '@/data/mockData';
import { useApp } from '@/context/AppContext';

export default function PerfilPage() {
  const { openUploadModal } = useApp();

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Profile Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-[#151027] via-[#1A1238] to-[#120B24] border border-[rgba(139,46,255,0.3)] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-vice-pink shadow-[0_0_20px_rgba(255,20,147,0.4)] flex-shrink-0">
            <Image
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                {CURRENT_USER.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-vice-pink/20 text-vice-pink border border-vice-pink/40">
                PRO
              </span>
            </div>

            <p className="text-xs text-vice-blue font-mono mt-0.5">{CURRENT_USER.handle}</p>

            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{CURRENT_USER.role}</span>
              </div>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-[11px] text-vice-textMuted">Leonida Hub</span>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="flex items-center gap-6 sm:gap-8 bg-[#100B1D]/80 border border-purple-500/20 px-6 py-4 rounded-2xl text-center">
          <div>
            <p className="text-xl font-black text-white font-display">{CURRENT_USER.totalViews}</p>
            <p className="text-[10px] text-zinc-400 uppercase">Visualizações</p>
          </div>
          <div className="h-8 w-[1px] bg-purple-500/20" />
          <div>
            <p className="text-xl font-black text-white font-display">{CURRENT_USER.likes}</p>
            <p className="text-[10px] text-zinc-400 uppercase">Curtidas</p>
          </div>
          <div className="h-8 w-[1px] bg-purple-500/20" />
          <div>
            <p className="text-xl font-black text-white font-display">{CURRENT_USER.followers}</p>
            <p className="text-[10px] text-zinc-400 uppercase">Seguidores</p>
          </div>
        </div>
      </div>

      {/* Saved Clips Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-purple-500/15">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white font-display">
              Seus Clipes Salvos e Publicados
            </h3>
          </div>

          <button
            onClick={openUploadModal}
            className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple shadow-[0_0_12px_rgba(255,20,147,0.35)] cursor-pointer"
          >
            Novo Clipe
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CREATOR_STUDIO_VIDEOS.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-[#151027] border border-purple-500/20 hover:border-vice-pink/40 overflow-hidden flex flex-col justify-between transition-all"
            >
              <div className="relative aspect-video w-full bg-black/40">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-2 right-2 px-1.5 py-0.2 rounded bg-black/80 text-[10px] font-mono text-zinc-300">
                  {item.duration}
                </span>
              </div>

              <div className="p-4 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-vice-pink transition-colors">
                  {item.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-vice-textMuted pt-2 border-t border-purple-500/15">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-vice-blue" />
                    {item.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-vice-pink" />
                    {item.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
