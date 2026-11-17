'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Scissors, Film, Crown, ArrowRight, Sparkles } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      id: 'trend-radar',
      tag: 'TREND RADAR',
      title: 'Descubra o que está em alta.',
      description:
        'Acompanhe vídeos em ascensão, assuntos populares e criadores que estão conquistando espaço no universo GTA 6.',
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      glowColor: 'hover:shadow-[0_12px_35px_rgba(16,185,129,0.22)] hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      badge: 'Tempo Real',
      link: '/app/trend-radar',
    },
    {
      id: 'ai-clipper',
      tag: 'AI CLIPPER',
      title: 'Encontre os melhores momentos.',
      description:
        'Uma experiência de criação planejada para identificar momentos interessantes em vídeos e transmissões e facilitar a produção de cortes.',
      icon: <Scissors className="w-6 h-6 text-vice-blue" />,
      glowColor: 'hover:shadow-[0_12px_35px_rgba(0,217,255,0.22)] hover:border-cyan-400/40',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30',
      badge: 'Em Desenvolvimento',
      link: '/app/clipper',
    },
    {
      id: 'clips-feed',
      tag: 'CLIPS FEED',
      title: 'Explore os melhores clipes.',
      description:
        'Descubra gameplays, momentos engraçados, descobertas e conteúdos publicados pela comunidade em formatos vertical e horizontal.',
      icon: <Film className="w-6 h-6 text-vice-pink" />,
      glowColor: 'hover:shadow-[0_12px_35px_rgba(255,20,147,0.22)] hover:border-pink-500/40',
      iconBg: 'bg-pink-500/15 border-pink-500/30',
      badge: 'Comunidade',
      link: '/app/explorar',
    },
    {
      id: 'creator-studio',
      tag: 'CREATOR STUDIO',
      title: 'Acompanhe seu crescimento.',
      description:
        'Organize seus conteúdos, acompanhe suas publicações e visualize o desempenho do seu perfil como criador.',
      icon: <Crown className="w-6 h-6 text-amber-400" />,
      glowColor: 'hover:shadow-[0_12px_35px_rgba(245,158,11,0.22)] hover:border-amber-400/40',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      badge: 'Criadores',
      link: '/app/criadores',
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative select-none bg-[#070611]">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-vice-pink text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recursos da Plataforma</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black italic uppercase font-display text-white tracking-tight leading-tight mb-4">
            DESCUBRA TUDO O QUE VOCÊ{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vice-pink to-vice-purple">
              PODE FAZER.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-vice-textMuted">
            Ferramentas integradas para transformar sua paixão por GTA 6 em clipes de alto engajamento.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {features.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-3xl bg-[#151027] border border-[rgba(139,46,255,0.22)] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 cursor-pointer ${item.glowColor}`}
            >
              <div>
                {/* Top Row: Icon + Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${item.iconBg}`}
                  >
                    {item.icon}
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                    {item.badge}
                  </span>
                </div>

                {/* Tag & Title */}
                <span className="text-[11px] font-mono font-bold text-vice-pink uppercase tracking-widest block mb-2">
                  {item.tag}
                </span>

                <h3 className="text-xl sm:text-2xl font-bold text-white font-display mb-3 group-hover:text-vice-pink transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-vice-textMuted leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              {/* Link CTA */}
              <Link
                href={item.link}
                className="inline-flex items-center gap-2 text-xs font-bold text-vice-blue group-hover:text-white transition-colors pt-4 border-t border-purple-500/15"
              >
                <span>Conhecer recurso</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
