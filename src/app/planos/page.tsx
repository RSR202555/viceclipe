'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Check,
  Zap,
  Crown,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { ViceLogo } from '@/components/ui/ViceLogo';
import { LandingFooter } from '@/components/landing/LandingFooter';

function PlanosContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const redirectParam = searchParams.get('redirect') || '/app';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      id: 'vice-clipper',
      slug: billingCycle === 'annual' ? 'vice-clipper-annual' : 'vice-clipper-monthly',
      name: 'Vice Clipper',
      tagline: 'Ideal para criadores em ascensão e clipadores entusiastas.',
      badge: 'Essencial',
      price: billingCycle === 'monthly' ? '30' : '25',
      totalAnnual: 'R$ 300/ano',
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
      ctaText: 'Assinar Vice Clipper',
    },
    {
      id: 'vice-clipper-pro',
      slug: billingCycle === 'annual' ? 'vice-clipper-pro-annual' : 'vice-clipper-pro-monthly',
      name: 'Vice Clipper PRO',
      tagline: 'Poder máximo para streamers profissionais e canais de elite.',
      badge: 'MAIS POPULAR',
      price: billingCycle === 'monthly' ? '50' : '45',
      totalAnnual: 'R$ 540/ano',
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
      ctaText: 'Assinar Vice Clipper PRO',
    },
  ];

  const comparisonFeatures = [
    { name: 'Trend Radar de GTA 6 em tempo real', basic: true, pro: true },
    { name: 'Monitoramento de canais e criadores', basic: true, pro: true },
    { name: 'Remoção de marca d’água', basic: true, pro: true },
    { name: 'Enquadramento inteligente 9:16 para Reels e TikTok', basic: true, pro: true },
    { name: 'Volume de clipes gerados por mês', basic: 'Até 40 clipes', pro: 'ILIMITADO' },
    { name: 'Resolução máxima de exportação', basic: 'Full HD 1080p', pro: 'Ultra HD 4K 60FPS' },
    { name: 'Detecção de momentos épicos por IA neural', basic: 'Básico', pro: 'Avançado (Áudio + Visão)' },
    { name: 'Fila de renderização em nuvem', basic: 'Padrão', pro: 'Prioritária Ultrarrápida' },
    { name: 'Legendas automáticas sincronizadas', basic: false, pro: true },
    { name: 'Creator Studio com métricas preditivas', basic: false, pro: true },
    { name: 'Selo de Criador PRO Verificado', basic: false, pro: true },
    { name: 'Suporte VIP via Discord e WhatsApp', basic: false, pro: true },
  ];

  const faqs = [
    {
      q: 'Como funciona o acesso à plataforma?',
      a: 'O VICE CLIPPER é um serviço SaaS exclusivo para assinantes. Ao assinar qualquer plano, seu acesso a todas as ferramentas internas (Trend Radar, AI Clipper, Creator Studio e Comunidade) é liberado imediatamente após a confirmação do pagamento.',
    },
    {
      q: 'Quais formas de pagamento são aceitas?',
      a: 'Aceitamos PIX com confirmação instantânea em segundos e Cartão de Crédito em até 12x com aprovação imediata.',
    },
    {
      q: 'Posso cancelar minha assinatura quando quiser?',
      a: 'Sim, com um clique. Não há fidelidade ou taxas de cancelamento. Ao cancelar, você continuará com acesso total até o fim do período já pago.',
    },
    {
      q: 'Qual a diferença entre os planos Mensal e Anual?',
      a: 'No plano anual você garante um desconto exclusivo de R$ 60 no ano: o plano Vice Clipper sai de R$ 30 por apenas R$ 25/mês, e o plano PRO sai de R$ 50 por apenas R$ 45/mês.',
    },
    {
      q: 'Como recebo suporte?',
      a: 'Assinantes contam com suporte direto via comunidade, chat e nossa equipe técnica especializada em criadores de conteúdo.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070611] text-white flex flex-col justify-between selection:bg-vice-pink selection:text-white">
      {/* Top Header */}
      <header className="border-b border-purple-500/15 bg-[#0A0618]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/">
            <ViceLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-vice-textMuted hover:text-white transition-colors"
            >
              Já sou assinante
            </Link>
            <Link
              href="#plans"
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(255,20,147,0.4)]"
            >
              Ver Planos
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {/* Subscription Required Banner (if redirected) */}
        {errorParam === 'subscription_required' && (
          <div className="bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border-b border-amber-500/40 py-3.5 px-4 text-center">
            <div className="max-w-4xl mx-auto flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Esta área é exclusiva para assinantes ativos do VICE CLIPPER. Escolha um plano abaixo para liberar seu acesso imediatamente.
              </span>
            </div>
          </div>
        )}

        {/* Hero Banner */}
        <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-gradient-to-r from-pink-600/15 via-purple-600/15 to-cyan-600/15 blur-[140px] pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-vice-pink text-xs font-bold uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>Planos Oficiais & Assinatura</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black italic uppercase font-display text-white tracking-tight leading-tight mb-4">
              DESBLOQUEIE TODO O PODER DO{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple">
                VICE CLIPPER
              </span>
            </h1>

            <p className="text-sm sm:text-base text-vice-textMuted max-w-2xl mx-auto mb-8">
              Tenha acesso às ferramentas mais avançadas de monitoramento de tendências e geração de cortes inteligentes para dominar o conteúdo de GTA 6 em Leonida.
            </p>

            {/* Billing Cycle Switcher */}
            <div className="inline-flex items-center bg-[#100B1D] border border-purple-500/30 p-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
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
        </section>

        {/* Pricing Cards */}
        <section id="plans" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
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

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-purple-500/20">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-bold text-vice-textMuted">R$</span>
                      <span className="text-5xl font-black font-display text-white tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-sm font-semibold text-vice-textMuted">
                        {plan.period}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-zinc-400">
                      <span>{plan.annualNote}</span>
                      {plan.savings && (
                        <span className="text-vice-pink font-bold">{plan.savings}</span>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mb-8">
                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
                      O que está incluído:
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300">
                          <div
                            className={`p-0.5 rounded-full mt-0.5 shrink-0 ${
                              plan.highlighted
                                ? 'bg-vice-pink/20 text-vice-pink'
                                : 'bg-vice-blue/20 text-vice-blue'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={`/checkout?plano=${plan.id}&cycle=${billingCycle}&redirect=${encodeURIComponent(
                    redirectParam
                  )}`}
                  className={`w-full py-4 rounded-full text-center text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple hover:opacity-95 text-white shadow-[0_0_25px_rgba(255,20,147,0.55)]'
                      : 'bg-[#100B1D] hover:bg-[#1C1438] text-white border border-purple-500/30 hover:border-vice-pink/60 shadow-[0_4px_15px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center flex items-center justify-center gap-6 text-xs text-vice-textMuted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-vice-blue" /> Pagamento 100% Seguro
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-vice-pink" /> Liberação Instantânea via PIX
            </span>
            <span>•</span>
            <span>Sem fidelidade (Cancele quando quiser)</span>
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-tight">
              Comparativo Detalhado de Recursos
            </h2>
            <p className="text-xs sm:text-sm text-vice-textMuted mt-1">
              Escolha a potência ideal para o seu nível de produção de conteúdo
            </p>
          </div>

          <div className="bg-[#120B24]/90 border border-purple-500/25 rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-500/20 bg-[#151027]">
                  <th className="py-4 px-6 text-sm font-bold text-zinc-300">Recurso</th>
                  <th className="py-4 px-6 text-center text-sm font-bold text-zinc-300 w-1/4">
                    Vice Clipper
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-bold text-vice-pink w-1/4">
                    Vice Clipper PRO
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 text-xs sm:text-sm">
                {comparisonFeatures.map((item, i) => (
                  <tr key={i} className="hover:bg-purple-900/10 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-zinc-200">{item.name}</td>
                    <td className="py-3.5 px-6 text-center text-zinc-300">
                      {typeof item.basic === 'boolean' ? (
                        item.basic ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )
                      ) : (
                        item.basic
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center font-bold text-vice-pink">
                      {typeof item.pro === 'boolean' ? (
                        item.pro ? (
                          <Check className="w-4 h-4 text-vice-pink mx-auto" />
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )
                      ) : (
                        item.pro
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight">
              Perguntas Frequentes
            </h2>
            <p className="text-xs text-vice-textMuted mt-1">
              Tire todas as suas dúvidas sobre a assinatura do VICE CLIPPER
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#120B24] border border-purple-500/20 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-vice-pink transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-vice-textMuted transition-transform ${
                      openFaq === idx ? 'rotate-180 text-vice-pink' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-vice-textMuted border-t border-purple-500/10 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default function PlanosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070611] text-white flex items-center justify-center">Carregando planos...</div>}>
      <PlanosContent />
    </Suspense>
  );
}
