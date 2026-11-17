'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Progress, Tooltip } from 'antd';
import {
  Scissors,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Bot,
  Play,
  RotateCw,
} from 'lucide-react';

interface ViceAiClipperSectionProps {
  onOpenUploader?: () => void;
}

export const ViceAiClipperSection: React.FC<ViceAiClipperSectionProps> = ({
  onOpenUploader,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [progressVal, setProgressVal] = useState<number>(78);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const steps = [
    { num: 1, label: 'Analisar' },
    { num: 2, label: 'Selecionar' },
    { num: 3, label: 'Editar' },
    { num: 4, label: 'Exportar' },
  ];

  const handleSimulateClipping = () => {
    setIsProcessing(true);
    setProgressVal(10);
    const interval = setInterval(() => {
      setProgressVal((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

  return (
    <div className="relative rounded-2xl bg-[#151027] border border-[rgba(139,46,255,0.22)] p-5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.45)] overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[rgba(139,46,255,0.15)] gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-vice-pink shadow-[0_0_12px_rgba(255,20,147,0.3)]">
            <Scissors className="w-4 h-4 text-vice-pink" />
          </div>
          <div>
            <h4 className="text-white font-bold text-base leading-tight tracking-wide flex items-center gap-1.5">
              <span>Vice AI Clipper</span>
              <span className="text-[10px] font-black text-vice-blue bg-vice-blue/15 px-1.5 py-0.2 rounded border border-vice-blue/30">
                PRO
              </span>
            </h4>
            <p className="text-[11px] text-vice-textMuted">
              Encontre e edite os melhores momentos automaticamente com IA
            </p>
          </div>
        </div>

        {/* Steps Breadcrumb */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {steps.map((st, i) => (
            <React.Fragment key={st.num}>
              <div
                onClick={() => setCurrentStep(st.num)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  currentStep === st.num
                    ? 'bg-vice-pink text-white shadow-[0_0_8px_rgba(255,20,147,0.4)]'
                    : 'text-vice-textMuted hover:text-white'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/40 text-[10px] flex items-center justify-center font-bold">
                  {st.num}
                </span>
                <span>{st.label}</span>
              </div>
              {i < steps.length - 1 && (
                <span className="text-zinc-600 text-xs">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content: Left Dropzone + Right AI Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Left: Drag & Drop Upload Zone */}
        <div
          onClick={onOpenUploader}
          className="border-2 border-dashed border-[rgba(139,46,255,0.35)] hover:border-vice-pink/60 bg-[#100B1D]/70 rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-[#150F26] group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-vice-pink mb-3 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,20,147,0.35)] transition-all">
            <UploadCloud className="w-6 h-6 text-vice-pink" />
          </div>

          <h5 className="text-sm font-bold text-white group-hover:text-vice-pink transition-colors">
            Arraste seu vídeo ou cole o link
          </h5>
          <p className="text-xs text-vice-textMuted mt-1 mb-4">
            YouTube, Twitch, Kick ou envie um arquivo MP4/MOV
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenUploader) onOpenUploader();
            }}
            className="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple hover:opacity-95 shadow-[0_0_12px_rgba(255,20,147,0.35)] flex items-center gap-1.5 transition-all group-hover:scale-105"
          >
            <span>Selecionar Arquivo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: AI Analysis Status Card with Robot Mascot */}
        <div className="relative rounded-2xl bg-gradient-to-br from-[#120B24] to-[#1A0E38] border border-[rgba(139,46,255,0.25)] p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2 z-10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-vice-pink font-display uppercase tracking-wider">
                  IA analisando...
                </span>
                <span className="w-2 h-2 rounded-full bg-vice-blue animate-pulse" />
              </div>

              {/* Checklist */}
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex items-center gap-2 text-xs text-zinc-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Detectando momentos</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Encontrando destaques</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Gerando sugestões</span>
                </div>
              </div>
            </div>

            {/* AI Cyborg Mascot */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src="/images/ai-mascot.png"
                alt="Vice AI Clipper Bot"
                fill
                className="object-contain drop-shadow-[0_0_15px_rgba(0,217,255,0.4)]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="mt-3 pt-2 border-t border-purple-500/15">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-400">Progresso do pipeline</span>
              <span className="font-bold text-vice-pink font-mono">{progressVal}%</span>
            </div>

            <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-purple-500/20">
              <div
                className="h-full bg-gradient-to-r from-vice-pink via-vice-purple to-vice-blue rounded-full transition-all duration-500 shadow-[0_0_10px_#FF1493]"
                style={{ width: `${progressVal}%` }}
              />
            </div>

            <div className="mt-2 flex justify-end">
              <button
                onClick={handleSimulateClipping}
                disabled={isProcessing}
                className="text-[10px] text-vice-blue hover:text-white flex items-center gap-1 font-semibold transition-colors"
              >
                <RotateCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Processando...' : 'Simular Nova Análise'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
