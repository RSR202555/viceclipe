'use client';

import React from 'react';
import { Scissors, Sparkles } from 'lucide-react';
import { ViceClipperStudio } from '@/components/clipper/ViceClipperStudio';

export default function ClipperPage() {
  return (
    <div className="flex flex-col gap-6 select-none">
      <div className="pb-4 border-b border-purple-500/15">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-vice-pink text-xs font-bold uppercase tracking-wider mb-2">
          <Scissors className="w-3.5 h-3.5" />
          <span>Inteligência Artificial de Leonida</span>
        </div>
        <h1 className="text-3xl font-black italic uppercase font-display text-white">
          Vice AI Clipper Hub
        </h1>
        <p className="text-sm text-vice-textMuted max-w-2xl">
          Selecione arquivos de gameplay, envie vídeos do seu PC ou escolha transmissões para que a IA identifique os melhores momentos, recorte na timeline e gere clipes verticais em 4K prontos para TikTok, Shorts e Reels.
        </p>
      </div>

      {/* Main Interactive AI Clipper Studio */}
      <ViceClipperStudio />
    </div>
  );
}
