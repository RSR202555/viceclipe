'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Scissors,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Film,
  ArrowRight,
  Bot,
  Play,
  RotateCw,
  Layers,
} from 'lucide-react';

export const AIClipperHighlight: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative select-none bg-[#090514] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[350px] bg-pink-900/15 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[350px] bg-cyan-900/15 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-vice-pink text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clipper Studio Inteligente</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black italic uppercase font-display text-white tracking-tight leading-tight mb-4">
            SEU PRÓXIMO CLIPE PODE ESTAR{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vice-pink to-vice-purple">
              A UM MOMENTO DE DISTÂNCIA.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-vice-textMuted">
            Encontre momentos marcantes, selecione os melhores trechos e prepare seus vídeos para compartilhar em formatos verticais e horizontais.
          </p>
        </div>

        {/* AI Clipper Mockup Stage */}
        <div className="w-full max-w-5xl rounded-3xl bg-[#151027] border border-[rgba(139,46,255,0.3)] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(255,20,147,0.2)] flex flex-col gap-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-purple-500/15 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-vice-pink shadow-[0_0_15px_rgba(255,20,147,0.3)]">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <span>Vice AI Clipper Studio</span>
                  <span className="text-[10px] font-black text-vice-blue bg-vice-blue/15 px-2 py-0.5 rounded border border-vice-blue/30">
                    EM DESENVOLVIMENTO
                  </span>
                </h3>
                <p className="text-xs text-vice-textMuted">
                  Pipeline automatizado de corte e re-enquadramento para criadores
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300">
                Resolução 4K
              </span>
              <span className="px-2.5 py-1 rounded-md bg-vice-pink/15 border border-vice-pink/30 text-vice-pink font-semibold">
                60 FPS
              </span>
            </div>
          </div>

          {/* Interactive Mockup Body: Left Upload/Timeline + Right AI Detection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 7 cols: Video Source + Timeline Preview */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Fake Source Input */}
              <div className="p-4 rounded-2xl bg-[#100B1D] border border-purple-500/20 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold">Fonte de Vídeo:</span>
                  <span className="text-vice-blue font-mono">Stream ao Vivo • 01:45:20</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300 font-mono truncate">
                  <UploadCloud className="w-4 h-4 text-vice-pink flex-shrink-0" />
                  <span className="truncate">https://twitch.tv/leonida_streamer/v/982144</span>
                </div>
              </div>

              {/* Video Timeline Preview with Heatmap Moments */}
              <div className="p-4 rounded-2xl bg-[#100B1D] border border-purple-500/20 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Linha do Tempo com Destaques</span>
                  <span className="text-emerald-400 text-[11px] font-bold">4 Momentos Detectados</span>
                </div>

                {/* Simulated Timeline Waveform / Heatmap */}
                <div className="relative h-12 w-full bg-black/50 rounded-xl overflow-hidden border border-purple-500/30 p-1 flex items-center">
                  {/* Heatmap spikes */}
                  <div className="flex items-end justify-between w-full h-full px-2 gap-1 opacity-70">
                    {[15, 25, 40, 85, 95, 60, 30, 20, 75, 90, 80, 45, 20, 10, 65, 90, 100, 70, 35, 20].map(
                      (h, i) => (
                        <div
                          key={i}
                          className={`w-full rounded-t transition-all ${
                            h > 70
                              ? 'bg-gradient-to-t from-vice-pink to-vice-purple shadow-[0_0_8px_#FF1493]'
                              : 'bg-zinc-700/60'
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      )
                    )}
                  </div>

                  {/* Cut marker box */}
                  <div className="absolute left-[38%] w-[22%] h-full border-2 border-vice-pink bg-vice-pink/20 rounded backdrop-blur-[1px] flex items-center justify-center">
                    <span className="text-[10px] font-black text-white bg-black/80 px-1 rounded">
                      00:45
                    </span>
                  </div>
                </div>

                {/* Aspect Ratio Selector Preview */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-zinc-400">Enquadramento Automático:</span>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-vice-pink text-white font-bold text-xs shadow-[0_0_10px_#FF1493]">
                      9:16 Vertical (Shorts/Reels)
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/5 text-zinc-400 text-xs">
                      16:9 Horizontal
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 cols: AI Status Card with Cyborg Mascot */}
            <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-[#120B24] to-[#1C103D] border border-purple-500/30 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-vice-pink uppercase tracking-wider block">
                      Status da Análise
                    </span>
                    <h4 className="text-base font-bold text-white font-display">
                      Detecção Neural Leonida
                    </h4>
                  </div>

                  <div className="relative w-14 h-14">
                    <Image
                      src="/images/ai-mascot.png"
                      alt="Vice AI Clipper Bot"
                      fill
                      className="object-contain drop-shadow-[0_0_15px_rgba(0,217,255,0.4)]"
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Perseguição policial 5 estrelas (+98% impacto)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Salto acrobático com esportivo (+94% viral)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Diálogo cômico entre NPCs (+89% engajamento)</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="pt-3 border-t border-purple-500/20">
                <div className="flex justify-between text-xs text-zinc-400 mb-1 font-mono">
                  <span>Renderização simulada</span>
                  <span className="text-vice-pink font-bold">100% Pronto</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-purple-500/20">
                  <div className="h-full bg-gradient-to-r from-vice-pink via-vice-purple to-vice-blue w-full shadow-[0_0_8px_#FF1493]" />
                </div>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-purple-500/15 gap-4">
            <p className="text-xs text-vice-textMuted text-center sm:text-left">
              * Recursos de inteligência artificial em fase de homologação técnica. Entre na lista de espera.
            </p>
            <Link
              href="/app/clipper"
              className="px-7 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple hover:opacity-95 shadow-[0_0_18px_rgba(255,20,147,0.4)] flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>CONHECER O AI CLIPPER NO APP</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
