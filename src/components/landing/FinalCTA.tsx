'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Play, ShieldCheck } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative select-none bg-[#070611] overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-gradient-to-r from-pink-600/20 via-purple-600/25 to-cyan-500/20 blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 rounded-[36px] bg-gradient-to-br from-[#120B24] via-[#1A0D38] to-[#250F4D] border border-[rgba(139,46,255,0.4)] p-8 sm:p-14 lg:p-16 text-center shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(255,20,147,0.25)]">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-vice-blue text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>JUNTE-SE À COMUNIDADE DE LEONIDA</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black italic uppercase font-display text-white tracking-tight leading-tight mb-5 max-w-3xl mx-auto drop-shadow-md">
          SEU PRÓXIMO GRANDE CLIPE{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple drop-shadow-[0_0_30px_rgba(255,20,147,0.7)]">
            COMEÇA AQUI.
          </span>
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed mb-10">
          Entre para o <strong className="text-white">VICE CLIPPER</strong> e descubra uma nova forma de encontrar, criar e compartilhar momentos com a comunidade mundial de GTA 6.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/cadastro"
            className="w-full sm:w-auto px-9 py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple hover:opacity-95 shadow-[0_0_25px_rgba(255,20,147,0.6)] transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>CRIAR MINHA CONTA</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/app"
            className="w-full sm:w-auto px-9 py-4 rounded-full text-sm font-bold text-vice-blue hover:text-white bg-[#0A0516]/80 hover:bg-[#120B24] border border-cyan-400/40 hover:border-cyan-300 shadow-[0_0_20px_rgba(0,217,255,0.25)] backdrop-blur-md transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>ACESSAR PLATAFORMA</span>
          </Link>
        </div>

        {/* Trust Footnote */}
        <div className="mt-8 pt-6 border-t border-purple-500/15 flex items-center justify-center gap-2 text-xs text-vice-textMuted">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Cadastro 100% gratuito • Sem necessidade de cartão de crédito</span>
        </div>
      </div>
    </section>
  );
};
