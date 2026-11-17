'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

export const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const plans = [
    {
      id: 'vice-clipper',
      name: 'Vice Clipper',
      tagline: 'Ideal para criadores em ascensão e clipadores entusiastas.',
      badge: 'Essencial',
      price: billingCycle === 'monthly' ? '30' : '25',
      period: '/mês',
      annualNote: billingCycle === 'annual' ? 'Cobrado anualmente (R$ 300/ano)' : 'Cobrado mensalmente',
      savings: billingCycle === 'annual' ? 'Economia de R$ 60 no ano' : null,
      highlighted: false,
      features: [
        'Acesso completo ao Trend Radar de Leonida',
        'Criação de até 40 clipes inteligentes por mês',
        'Exportação em Full HD (1080p a 60 FPS)',
        'Enquadramento automático 9:16 (TikTok, Reels e Shorts)',
        'Sem marca d’água da plataforma',
        'Armazenamento em nuvem de clipes favoritos',
        'Acesso à comunidade e feed de criadores',
      ],
      ctaText: 'Escolher Vice Clipper',
      buttonStyle:
        'bg-[#100B1D] hover:bg-[#1C1438] text-white border border-purple-500/30 hover:border-vice-pink/60 shadow-[0_4px_15px_rgba(0,0,0,0.3)]',
    },
    {
      id: 'vice-clipper-pro',
      name: 'Vice Clipper PRO',
      tagline: 'Poder máximo para streamers profissionais e canais de elite.',
      badge: 'MAIS POPULAR',
      price: billingCycle === 'monthly' ? '50' : '45',
      period: '/mês',
      annualNote: billingCycle === 'annual' ? 'Cobrado anualmente (R$ 540/ano)' : 'Cobrado mensalmente',
      savings: billingCycle === 'annual' ? 'Economia de R$ 60 no ano' : null,
      highlighted: true,
      features: [
        'Tudo incluso no plano Vice Clipper e mais:',
        'Clipes inteligentes ILIMITADOS por mês',
        'Exportação máxima em Ultra HD 4K a 60 FPS',
        'Fila prioritária com renderização ultrarrápida',
        'Detecção neural avançada de perseguições, áudio e tiroteios',
        'Legendas automáticas estilizadas e sincronizadas',
        'Creator Studio PRO com métricas e insights preditivos',
        'Selo exclusivo de Criador PRO Verificado no perfil',
      ],
      ctaText: 'Garantir Vice Clipper PRO',
      buttonStyle:
        'bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple hover:opacity-95 text-white shadow-[0_0_25px_rgba(255,20,147,0.55)]',
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative select-none bg-[#070611] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-gradient-to-r from-purple-900/15 via-pink-900/15 to-cyan-900/15 blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col items-center relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-vice-pink text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Planos & Investimento</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black italic uppercase font-display text-white tracking-tight leading-tight mb-4">
            ESCOLHA O PLANO CERTO PARA{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vice-pink to-vice-purple">
              IMPULSIONAR SEUS CLIPES.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-vice-textMuted">
            Planos flexíveis pensados para criadores de todos os tamanhos. Acesso obrigatório por assinatura com liberação instantânea.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-8 inline-flex items-center bg-[#100B1D] border border-purple-500/30 p-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_0_12px_rgba(255,20,147,0.4)]'
                  : 'text-vice-textMuted hover:text-white'
              }`}
            >
              Mensal
            </button>

            <button
              onClick={() => setBillingCycle('annual')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_0_12px_rgba(255,20,147,0.4)]'
                  : 'text-vice-textMuted hover:text-white'
              }`}
            >
              <span>Anual</span>
              <span className="bg-vice-blue/20 text-vice-blue border border-vice-blue/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Economize R$ 60
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-[#151027]/95 border-2 border-vice-pink shadow-[0_0_40px_rgba(255,20,147,0.3)] md:-translate-y-2'
                  : 'bg-[#120B24]/90 border border-purple-500/20 hover:border-purple-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
              }`}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-[0_0_15px_rgba(255,20,147,0.6)] flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>{plan.badge}</span>
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide">
                    {plan.name}
                  </h3>
                  {!plan.highlighted && (
                    <span className="text-[10px] uppercase font-bold text-vice-blue bg-vice-blue/10 border border-vice-blue/30 px-2.5 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-vice-textMuted mb-6 min-h-[36px]">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-purple-500/15">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-vice-textMuted">R$</span>
                    <span className="text-5xl font-black font-display text-white tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-sm font-semibold text-vice-textMuted">
                      {plan.period}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-1.5 font-mono">
                    {plan.annualNote}
                  </p>

                  {plan.savings && (
                    <span className="inline-block mt-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      ✓ {plan.savings}
                    </span>
                  )}
                </div>

                {/* Features List */}
                <div className="flex flex-col gap-3 mb-8">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                    O que está incluído:
                  </span>

                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-200">
                      <div className="w-4 h-4 rounded-full bg-vice-pink/20 border border-vice-pink/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-vice-pink" />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <Link
                  href={`/checkout?plano=${plan.id}&cycle=${billingCycle}`}
                  className={`w-full py-3.5 px-6 rounded-full text-xs font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02] active:scale-95 ${plan.buttonStyle}`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[10px] text-zinc-500 text-center mt-3">
                  Ativação imediata • Pagamento 100% seguro via PIX ou Cartão
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Plan Comparison CTA */}
        <div className="mt-14 w-full max-w-4xl p-6 rounded-2xl bg-[#100B1D]/90 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-vice-blue flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Deseja ver o comparativo detalhado de cada funcionalidade?
              </h4>
              <p className="text-xs text-vice-textMuted">
                Confira a tabela completa de recursos, limites e tire suas dúvidas no FAQ oficial.
              </p>
            </div>
          </div>

          <Link
            href="/planos"
            className="px-5 py-2.5 rounded-full text-xs font-bold text-vice-blue hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all whitespace-nowrap cursor-pointer"
          >
            Ver Comparativo Completo →
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-vice-textMuted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pagamento Seguro via PIX ou Cartão</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-vice-blue" />
            <span>Sem fidelidade — cancele em 1 clique</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-vice-pink" />
            <span>Liberação instantânea do acesso</span>
          </div>
        </div>
      </div>
    </section>
  );
};
