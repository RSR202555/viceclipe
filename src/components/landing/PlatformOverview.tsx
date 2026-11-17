'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Play, Flame, Scissors, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';

export const PlatformOverview: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none bg-[#070611]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-purple-900/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-vice-blue text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ecossistema Completo</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black italic uppercase font-display text-white tracking-tight leading-tight mb-4">
            TUDO O QUE VOCÊ PRECISA PARA{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vice-pink to-vice-purple">
              ENCONTRAR OS MELHORES MOMENTOS.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-vice-textMuted leading-relaxed">
            O <strong className="text-white font-semibold">VICE CLIPPER</strong> reúne descoberta de conteúdo, tendências e ferramentas de criação em uma experiência pensada para criadores e fãs de GTA 6.
          </p>
        </div>

        {/* Visual Product Composition Mockup */}
        <div className="relative w-full max-w-5xl rounded-3xl border border-[rgba(139,46,255,0.35)] bg-[#100B1D]/80 p-2 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(139,46,255,0.2)] backdrop-blur-xl">
          {/* Top Mockup Header Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-purple-500/15 mb-3 text-xs text-vice-textMuted">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/60 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/60 inline-block" />
              <span className="text-zinc-500 font-mono text-[11px] ml-2">viceclipper.app/dashboard</span>
            </div>

            <Link
              href="/app"
              className="text-vice-blue hover:text-white flex items-center gap-1 font-semibold text-[11px] transition-colors"
            >
              <span>Abrir App ao Vivo</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Main Dashboard Preview Canvas */}
          <div className="relative aspect-[16/9] sm:aspect-[16/8.5] w-full rounded-2xl overflow-hidden border border-purple-500/20 bg-black/60">
            <Image
              src="/images/reference.png"
              alt="VICE CLIPPER Interface Preview"
              fill
              className="object-cover object-top opacity-95"
            />
            {/* Subtle Gradient Veil */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C061A]/80 via-transparent to-transparent pointer-events-none" />

            {/* Floating Glass Pill 1: Trend Radar Alert */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#151027]/90 border border-pink-500/40 shadow-[0_10px_25px_rgba(255,20,147,0.35)] backdrop-blur-md animate-bounce [animation-duration:4s]">
              <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-vice-pink">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-vice-textMuted uppercase font-bold">Tendência Leonida</p>
                <p className="text-xs font-black text-white">GTA 6 Gameplay +342%</p>
              </div>
            </div>

            {/* Floating Glass Pill 2: AI Clip Detector */}
            <div className="absolute bottom-6 right-4 sm:right-6 z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#151027]/90 border border-cyan-500/40 shadow-[0_10px_25px_rgba(0,217,255,0.35)] backdrop-blur-md">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-vice-blue">
                <Scissors className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-vice-textMuted uppercase font-bold">Corte Inteligente</p>
                <p className="text-xs font-black text-white">Formato 9:16 Vertical Pronto</p>
              </div>
            </div>
          </div>

          {/* Bottom Indicators in Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-2">
            <div className="p-3 rounded-xl bg-[#151027]/60 border border-purple-500/15 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-white">Feed em Tempo Real</h4>
                <p className="text-[11px] text-vice-textMuted">Momentos mais assistidos</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#151027]/60 border border-purple-500/15 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-vice-blue">
                <Scissors className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-white">Clipper Studio</h4>
                <p className="text-[11px] text-vice-textMuted">Produção simplificada de cortes</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#151027]/60 border border-purple-500/15 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-white">Comunidade Leonida</h4>
                <p className="text-[11px] text-vice-textMuted">Criadores e streamers verificados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
