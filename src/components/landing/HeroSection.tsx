'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Film, TrendingUp, Users, Play } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative min-h-[92vh] lg:min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
    >
      {/* 1. Cinematic Background Image (LANDING PAGE.png) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/LANDING PAGE.png"
          alt="Vice City Sunset Cinematic Scene"
          fill
          priority
          className="object-cover object-center scale-[1.02] transition-transform duration-1000"
        />

        {/* 2. Dark Overlay Gradients for Perfect Text Contrast & Edge Blending */}
        {/* Full dark veil */}
        <div className="absolute inset-0 bg-[#070611]/55" />

        {/* Top gradient for header contrast */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#070611] via-[#070611]/80 to-transparent" />

        {/* Bottom gradient blending seamlessly into the next section */}
        <div className="absolute bottom-0 inset-x-0 h-52 bg-gradient-to-t from-[#070611] via-[#070611]/90 to-transparent" />

        {/* Side vignette gradients */}
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#070611]/80 to-transparent hidden lg:block" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#070611]/80 to-transparent hidden lg:block" />

        {/* Radial ambient lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-pink-600/15 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[300px] bg-purple-600/20 blur-[130px] pointer-events-none" />
      </div>

      {/* 3. Hero Foreground Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Highlight Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-pink-500/40 text-vice-pink text-xs font-black tracking-[0.2em] uppercase mb-6 shadow-[0_0_20px_rgba(255,20,147,0.35)] backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-vice-blue" />
          <span>THE GTA 6 CLIPPING HUB</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tight uppercase font-display leading-[1.08] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] mb-5 max-w-4xl">
          OS MELHORES MOMENTOS.{' '}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple drop-shadow-[0_0_35px_rgba(255,20,147,0.65)]">
            VIRAM GRANDES CLIPES.
          </span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-xl text-zinc-200/90 max-w-2xl font-normal leading-relaxed mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Descubra tendências, encontre os momentos mais interessantes e transforme vídeos em clipes para compartilhar com a comunidade.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10">
          <Link
            href="/cadastro"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple hover:opacity-95 shadow-[0_0_25px_rgba(255,20,147,0.55)] transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>COMEÇAR AGORA</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/app"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-sm font-bold text-white bg-[#151027]/80 hover:bg-[#1D1636] border border-cyan-400/40 hover:border-cyan-300 shadow-[0_0_20px_rgba(0,217,255,0.25)] backdrop-blur-md transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-vice-blue hover:text-white"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>EXPLORAR PLATAFORMA</span>
          </Link>
        </div>

        {/* Indicators Below Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-zinc-300/90 pt-4 border-t border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Descoberta de tendências</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10">
            <Film className="w-4 h-4 text-vice-pink" />
            <span>Criação de clipes</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10">
            <Users className="w-4 h-4 text-vice-blue" />
            <span>Comunidade de criadores</span>
          </div>
        </div>
      </div>
    </section>
  );
};
