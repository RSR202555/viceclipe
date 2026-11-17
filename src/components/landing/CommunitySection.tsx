'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, CheckCircle2, Heart, Eye, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { TRENDING_VIDEOS, FEATURED_CREATOR } from '@/data/mockData';

export const CommunitySection: React.FC = () => {
  return (
    <section id="community" className="py-24 px-4 sm:px-6 lg:px-8 relative select-none bg-[#070611]">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-vice-blue text-xs font-bold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Comunidade GTA 6</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black italic uppercase font-display text-white tracking-tight leading-tight mb-4">
            FEITO PARA QUEM VIVE O{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vice-pink to-vice-purple">
              UNIVERSO GTA 6.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-vice-textMuted">
            Descubra criadores, acompanhe publicações e compartilhe seus melhores momentos com uma comunidade apaixonada pelo jogo.
          </p>
        </div>

        {/* Creators & Popular Clips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
          {TRENDING_VIDEOS.map((clip) => (
            <div
              key={clip.id}
              className="group rounded-3xl bg-[#151027] border border-[rgba(139,46,255,0.22)] overflow-hidden flex flex-col justify-between hover:border-vice-pink/40 hover:shadow-[0_12px_30px_rgba(139,46,255,0.2)] transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                <Image
                  src={clip.thumbnail}
                  alt={clip.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151027] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300">
                  {clip.duration}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-vice-pink transition-colors">
                  {clip.title}
                </h4>

                {/* Creator row */}
                <div className="pt-2 border-t border-purple-500/15 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-purple-400 flex-shrink-0">
                      <Image
                        src={clip.creator.avatar}
                        alt={clip.creator.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-semibold text-zinc-300 truncate">
                      {clip.creator.name}
                    </span>
                    {clip.creator.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-vice-blue flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-vice-textMuted font-mono">
                    <Heart className="w-3 h-3 text-vice-pink fill-current" />
                    <span>{clip.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Community Call to Action */}
        <Link
          href="/app/comunidade"
          className="px-8 py-3.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple hover:opacity-95 shadow-[0_0_20px_rgba(255,20,147,0.4)] flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>EXPLORAR COMUNIDADE NO APP</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};
