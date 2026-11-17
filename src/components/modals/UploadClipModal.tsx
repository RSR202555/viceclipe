'use client';

import React, { useState } from 'react';
import { Modal, Input, Radio, Button, Progress, message } from 'antd';
import {
  UploadCloud,
  Link,
  Scissors,
  Sparkles,
  CheckCircle2,
  Film,
  X,
  Play,
  RotateCw,
} from 'lucide-react';

interface UploadClipModalProps {
  open: boolean;
  onClose: () => void;
}

export const UploadClipModal: React.FC<UploadClipModalProps> = ({
  open,
  onClose,
}) => {
  const [url, setUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [step, setStep] = useState<'input' | 'analyzing' | 'success'>('input');
  const [progress, setProgress] = useState(0);

  const handleStartAnalysis = () => {
    setStep('analyzing');
    setProgress(15);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep('success');
          return 100;
        }
        return prev + 20;
      });
    }, 450);
  };

  const handleReset = () => {
    setStep('input');
    setProgress(0);
    setUrl('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      closeIcon={<X className="w-5 h-5 text-zinc-400 hover:text-white" />}
      styles={{
        content: {
          padding: 28,
          borderRadius: 24,
          backgroundColor: '#151027',
          border: '1px solid rgba(139, 46, 255, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(255, 20, 147, 0.25)',
        },
      }}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-purple-500/15">
          <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-vice-pink shadow-[0_0_15px_rgba(255,20,147,0.35)]">
            <Scissors className="w-5 h-5 text-vice-pink" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              Vice AI Clipper Studio
            </h3>
            <p className="text-xs text-vice-textMuted">
              Corte automático de melhores momentos de GTA 6 com inteligência artificial
            </p>
          </div>
        </div>

        {step === 'input' && (
          <div className="flex flex-col gap-4">
            {/* Dropzone */}
            <div className="border-2 border-dashed border-purple-500/30 hover:border-vice-pink/60 bg-[#100B1D]/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
              <UploadCloud className="w-10 h-10 text-vice-pink mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-white">
                Arraste seu arquivo MP4 ou MOV aqui
              </p>
              <p className="text-xs text-vice-textMuted mt-1">
                Suporte para vídeos de até 4GB e resolução até 4K 60fps
              </p>
            </div>

            {/* OR Link */}
            <div className="flex items-center gap-3 my-1">
              <div className="h-[1px] bg-purple-500/20 flex-1" />
              <span className="text-xs text-vice-textMuted uppercase font-semibold">
                ou cole o link da stream
              </span>
              <div className="h-[1px] bg-purple-500/20 flex-1" />
            </div>

            <Input
              size="large"
              prefix={<Link className="w-4 h-4 text-vice-textMuted mr-2" />}
              placeholder="https://youtube.com/watch?v=... ou twitch.tv/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            {/* Output Format */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#100B1D]/60 border border-purple-500/15">
              <span className="text-xs font-semibold text-zinc-300">
                Formato de Exportação:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-vice-pink text-white shadow-[0_0_10px_#FF1493]'
                      : 'text-zinc-400 bg-white/5'
                  }`}
                >
                  9:16 Vertical (Shorts/Reels)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-vice-pink text-white shadow-[0_0_10px_#FF1493]'
                      : 'text-zinc-400 bg-white/5'
                  }`}
                >
                  16:9 Horizontal
                </button>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartAnalysis}
              className="w-full py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple hover:opacity-95 shadow-[0_0_20px_rgba(255,20,147,0.4)] flex items-center justify-center gap-2 mt-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Iniciar Análise com IA</span>
            </button>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-vice-pink/15 border border-vice-pink/40 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(255,20,147,0.4)]">
              <RotateCw className="w-8 h-8 text-vice-pink animate-spin" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">
              Processando vídeo com a IA de Leonida...
            </h4>
            <p className="text-xs text-vice-textMuted max-w-sm mb-6">
              Identificando perseguições policiais, acrobacias de carros, diálogos de NPCs e momentos de tiroteio.
            </p>

            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
                <span>Progresso</span>
                <span className="text-vice-pink font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-black/60 rounded-full h-2.5 overflow-hidden border border-purple-500/20">
                <div
                  className="h-full bg-gradient-to-r from-vice-pink via-vice-purple to-vice-blue transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">
              4 Clipes Incríveis Gerados!
            </h4>
            <p className="text-xs text-vice-textMuted max-w-sm mb-6">
              A IA cortou os momentos mais eletrizantes com legendas sincronizadas e enquadramento automático para {aspectRatio}.
            </p>

            <button
              onClick={handleReset}
              className="px-8 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple hover:opacity-95 shadow-[0_0_15px_rgba(255,20,147,0.4)] transition-all cursor-pointer"
            >
              Ver Clipes Gerados no Hub
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
