'use client';

import React from 'react';
import { UploadCloud, Sparkles, CheckSquare, Film, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'INSIRA SEU CONTEÚDO',
      description:
        'O usuário poderá selecionar um arquivo local (MP4/MOV) ou utilizar uma fonte de vídeo compatível e autorizada de lives ou gravações.',
      icon: <UploadCloud className="w-6 h-6 text-vice-pink" />,
      tag: 'Entrada Flexível',
    },
    {
      number: '02',
      title: 'ANALISE OS MOMENTOS',
      description:
        'A ferramenta identificará possíveis momentos interessantes — perseguições, fugas, humor e diálogos — conforme os recursos de análise disponíveis.',
      icon: <Sparkles className="w-6 h-6 text-vice-blue" />,
      tag: 'Em Desenvolvimento',
    },
    {
      number: '03',
      title: 'ESCOLHA SEUS CORTES',
      description:
        'O usuário poderá visualizar uma lista de trechos sugeridos com pontuação de relevância e selecionar os seus favoritos com poucos cliques.',
      icon: <CheckSquare className="w-6 h-6 text-emerald-400" />,
      tag: 'Curadoria Ágil',
    },
    {
      number: '04',
      title: 'PREPARE SEU CLIPE',
      description:
        'Ajuste o enquadramento vertical (9:16) ou horizontal (16:9), adicione legendas automáticas e prepare o arquivo pronto para publicação.',
      icon: <Film className="w-6 h-6 text-amber-400" />,
      tag: 'Exportação 4K',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 relative select-none bg-[#090514]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[300px] bg-pink-900/10 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fluxo de Produção</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black italic uppercase font-display text-white tracking-tight leading-tight mb-4">
            DO VÍDEO AO CLIPE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vice-pink to-vice-purple">
              EM POUCOS PASSOS.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-vice-textMuted">
            Um fluxo intuitivo planejado para economizar horas de edição e acelerar suas publicações em redes sociais.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative rounded-3xl bg-[#151027] border border-[rgba(139,46,255,0.22)] p-6 sm:p-7 flex flex-col justify-between hover:border-vice-pink/40 hover:shadow-[0_12px_30px_rgba(139,46,255,0.2)] transition-all duration-300 group"
            >
              <div>
                {/* Step Header */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-vice-pink to-vice-purple">
                    {step.number}
                  </span>

                  <div className="w-11 h-11 rounded-xl bg-[#100B1D] border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                </div>

                {/* Tag */}
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-vice-blue inline-block mb-3">
                  {step.tag}
                </span>

                {/* Title */}
                <h3 className="text-base font-bold text-white uppercase font-display mb-2 group-hover:text-vice-pink transition-colors">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-vice-textMuted leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Progress Connector Indicator */}
              <div className="mt-6 pt-3 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Etapa {index + 1} de 4</span>
                {index < 3 && <span className="text-vice-pink">Próxima →</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
