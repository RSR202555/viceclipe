'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, message } from 'antd';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  User,
  Mail,
  Crown,
  ExternalLink,
  Copy,
  Clock,
  RotateCw,
  AlertTriangle,
} from 'lucide-react';
import { ViceLogo } from '@/components/ui/ViceLogo';
import { useAuth } from '@/context/AuthContext';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshSession } = useAuth();

  // Params
  const initialPlan = searchParams.get('plano') || 'pro';
  const initialCycle = (searchParams.get('cycle') as 'monthly' | 'annual') || 'annual';
  const redirectTarget = searchParams.get('redirect') || '/app';

  // State
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    initialPlan.includes('pro') ? 'vice-clipper-pro' : 'vice-clipper'
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(initialCycle);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');

  // User details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [isCheckingPix, setIsCheckingPix] = useState(false);
  const [pixApproved, setPixApproved] = useState(false);

  // PIX Data returned by Mercado Pago
  const [pixData, setPixData] = useState<{
    paymentId: number;
    qr_code: string;
    qr_code_base64: string;
    ticket_url: string;
  } | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync user details if logged in
  useEffect(() => {
    if (user) {
      setName(user.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Pricing calculations
  const isPro = selectedPlanId === 'vice-clipper-pro';
  const monthlyPrice = isPro ? 50 : 30;
  const annualTotal = isPro ? 540 : 300;
  const currentPrice = billingCycle === 'annual' ? annualTotal : monthlyPrice;
  const planSlug = `${selectedPlanId}-${billingCycle}`;

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Polling para checar status do PIX no Mercado Pago
  const checkPaymentStatus = async (paymentId: number, silent = false) => {
    if (!silent) setIsCheckingPix(true);

    try {
      const res = await fetch(`/api/checkout/mercado-pago/status?paymentId=${paymentId}`);
      const data = await res.json();

      if (data.approved) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setPixApproved(true);
        message.success('Pagamento PIX confirmado com sucesso!');
        await refreshSession();

        setTimeout(() => {
          router.push('/checkout/feedback?status=approved');
        }, 1500);
      } else if (!silent) {
        message.info('Pagamento ainda pendente de compensação no banco.');
      }
    } catch (err) {
      if (!silent) message.error('Erro ao verificar status do pagamento.');
    } finally {
      if (!silent) setIsCheckingPix(false);
    }
  };

  // Iniciar Polling Automático a cada 3.5 segundos
  const startPixPolling = (paymentId: number) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(() => {
      checkPaymentStatus(paymentId, true);
    }, 3500);
  };

  // Gerar Cobrança PIX Oficial no Mercado Pago
  const handleGeneratePix = async () => {
    const finalEmail = (email || user?.email || '').trim();
    if (!finalEmail) {
      message.error('Por favor, informe seu e-mail para gerar o PIX.');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/checkout/mercado-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug,
          userEmail: finalEmail,
          userName: name || user?.full_name || 'Criador GTA 6',
          paymentMethod: 'pix',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.qr_code) {
        setPixData({
          paymentId: data.paymentId,
          qr_code: data.qr_code,
          qr_code_base64: data.qr_code_base64,
          ticket_url: data.ticket_url,
        });
        message.success('QR Code PIX gerado com sucesso via Mercado Pago!');
        startPixPolling(data.paymentId);
      } else {
        message.error(data.error || 'Erro ao gerar cobrança PIX no Mercado Pago.');
      }
    } catch (err: any) {
      console.error(err);
      message.error('Falha de conexão com o servidor de pagamento.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Copiar código PIX Copia e Cola
  const copyPixCode = () => {
    if (!pixData?.qr_code) return;
    navigator.clipboard.writeText(pixData.qr_code);
    setCopiedPix(true);
    message.success('Código PIX Copia e Cola copiado com sucesso!');
    setTimeout(() => setCopiedPix(false), 3000);
  };

  // Iniciar Assinatura com Cartão de Crédito via Checkout do Mercado Pago
  const handleCardCheckout = async () => {
    const finalEmail = (email || user?.email || '').trim();
    if (!finalEmail) {
      message.error('Por favor, informe seu e-mail para a assinatura.');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/checkout/mercado-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug,
          userEmail: finalEmail,
          userName: name || user?.full_name || 'Criador GTA 6',
          paymentMethod: 'credit_card',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.init_point) {
        message.loading('Conectando ao checkout oficial do Mercado Pago...', 1.5);
        setTimeout(() => {
          window.location.href = data.init_point;
        }, 800);
      } else {
        message.error(data.error || 'Erro ao iniciar checkout de cartão no Mercado Pago.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error(err);
      message.error('Falha de conexão com o servidor de checkout.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070611] text-white flex flex-col justify-between selection:bg-vice-pink selection:text-white">
      {/* Header */}
      <header className="border-b border-purple-500/15 bg-[#0A0618]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/planos">
            <ViceLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3 text-xs text-vice-textMuted">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Checkout Oficial Mercado Pago</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12">
        {pixApproved ? (
          <div className="max-w-md mx-auto my-12 bg-[#151027] border border-emerald-500/50 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40 animate-pulse">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black uppercase font-display text-white mb-2">
              Pagamento PIX Aprovado!
            </h2>
            <p className="text-sm text-vice-textMuted mb-6">
              Seu pagamento foi confirmado pelo Mercado Pago e seu acesso total à plataforma VICE CLIPPER foi liberado.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-vice-pink font-semibold">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Redirecionando para a sua área de membros...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form & Payment (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Step 1: User Account */}
              <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-500/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-vice-pink/20 text-vice-pink text-xs font-bold flex items-center justify-center border border-vice-pink/30">
                      1
                    </div>
                    <h3 className="text-base font-bold text-white">Identificação da Conta</h3>
                  </div>
                  {user ? (
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                      Autenticado como {user.username || user.email}
                    </span>
                  ) : (
                    <span className="text-[11px] bg-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full">
                      Nova Assinatura
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 ml-1 mb-1 block">
                      Nome Completo
                    </label>
                    <Input
                      size="large"
                      prefix={<User className="w-4 h-4 text-vice-textMuted mr-2" />}
                      placeholder="Ex: Rian Flamengo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!!user}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 ml-1 mb-1 block">
                      E-mail de Acesso
                    </label>
                    <Input
                      size="large"
                      type="email"
                      prefix={<Mail className="w-4 h-4 text-vice-textMuted mr-2" />}
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!!user}
                      required
                    />
                  </div>
                </div>

                {!user && (
                  <p className="mt-3 text-[11px] text-vice-textMuted flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-vice-blue shrink-0" />
                    <span>
                      A assinatura será vinculada a este e-mail no Supabase. Já tem cadastro?{' '}
                      <Link
                        href={`/login?redirect=/checkout?plano=${selectedPlanId}`}
                        className="text-vice-pink hover:underline font-bold"
                      >
                        Entrar na conta
                      </Link>
                    </span>
                  </p>
                )}
              </div>

              {/* Step 2: Payment Method Choice (PIX vs Cartão) */}
              <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-purple-500/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-vice-pink/20 text-vice-pink text-xs font-bold flex items-center justify-center border border-vice-pink/30">
                      2
                    </div>
                    <h3 className="text-base font-bold text-white">Forma de Pagamento</h3>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Mercado Pago Oficial</span>
                  </div>
                </div>

                {/* Tabs for PIX / Card */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`py-3.5 px-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-[#151027] border-purple-500/20 text-vice-textMuted hover:text-white'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <div className="text-left">
                      <div>PIX Instantâneo</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">Aprovação em segundos</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`py-3.5 px-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'bg-gradient-to-r from-vice-pink/20 to-vice-purple/20 border-vice-pink text-white shadow-[0_0_15px_rgba(255,20,147,0.3)]'
                        : 'bg-[#151027] border-purple-500/20 text-vice-textMuted hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-vice-blue" />
                    <div className="text-left">
                      <div>Cartão de Crédito</div>
                      <div className="text-[10px] text-vice-textMuted">Recorrência automática</div>
                    </div>
                  </button>
                </div>

                {/* TAB 1: PIX INSTANTÂNEO COM MERCADO PAGO */}
                {paymentMethod === 'pix' && (
                  <div className="flex flex-col items-center bg-[#151027] border border-purple-500/20 rounded-2xl p-6 text-center">
                    {!pixData ? (
                      <div className="w-full flex flex-col items-center py-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                          <QrCode className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">
                          Pagamento via PIX Oficial Mercado Pago
                        </h4>
                        <p className="text-xs text-zinc-300 max-w-md mb-6 leading-relaxed">
                          Pague de qualquer banco através do QR Code ou Pix Copia e Cola. A compensação é automática pelo Banco Central e seu acesso é liberado em segundos.
                        </p>

                        <button
                          type="button"
                          onClick={handleGeneratePix}
                          disabled={isProcessing}
                          className="w-full max-w-md py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:opacity-95 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Zap className="w-4 h-4" />
                          <span>
                            {isProcessing
                              ? 'Gerando QR Code Oficial no Mercado Pago...'
                              : `Gerar PIX • R$ ${currentPrice},00`}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Aguardando pagamento no app do seu banco...</span>
                        </div>

                        {/* Real QR Code from Mercado Pago */}
                        <div className="p-3 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.25)] mb-4">
                          {pixData.qr_code_base64 ? (
                            <img
                              src={`data:image/png;base64,${pixData.qr_code_base64}`}
                              alt="QR Code Pix Mercado Pago"
                              className="w-52 h-52 object-contain"
                            />
                          ) : (
                            <div className="w-52 h-52 bg-zinc-900 rounded-lg flex items-center justify-center text-xs text-zinc-400">
                              QR Code Ativo
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-zinc-300 mb-4 max-w-sm">
                          Abra o aplicativo do seu banco (Nubank, Inter, Itaú, etc.), escolha{' '}
                          <strong className="text-white">Pagar via Pix com QR Code</strong> ou copie o código abaixo:
                        </p>

                        {/* Copia e Cola Field */}
                        <div className="w-full flex items-center gap-2 mb-4">
                          <Input
                            readOnly
                            value={pixData.qr_code}
                            className="bg-[#0A0618] border-purple-500/30 text-xs font-mono text-zinc-400 truncate"
                          />
                          <button
                            type="button"
                            onClick={copyPixCode}
                            className="px-4 py-2.5 bg-gradient-to-r from-vice-pink to-vice-purple text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:opacity-90 shrink-0 cursor-pointer shadow-[0_0_10px_rgba(255,20,147,0.4)]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedPix ? 'Copiado!' : 'Copiar Pix'}</span>
                          </button>
                        </div>

                        {/* Check Status Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-2">
                          <button
                            type="button"
                            onClick={() => checkPaymentStatus(pixData.paymentId, false)}
                            disabled={isCheckingPix}
                            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#100B1D] border border-emerald-500/30 hover:border-emerald-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <RotateCw className={`w-3.5 h-3.5 ${isCheckingPix ? 'animate-spin' : ''}`} />
                            <span>{isCheckingPix ? 'Consultando Mercado Pago...' : 'Já Paguei! Verificar Agora'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleGeneratePix}
                            disabled={isProcessing}
                            className="py-3 px-4 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-[#0A0618] border border-white/10"
                          >
                            Gerar Novo Código
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: CARTÃO DE CRÉDITO RECORRENTE COM MERCADO PAGO */}
                {paymentMethod === 'credit_card' && (
                  <div className="flex flex-col gap-4 bg-[#151027] border border-purple-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-vice-pink/20 text-vice-pink flex items-center justify-center border border-vice-pink/30 shrink-0">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">
                          Assinatura Recorrente no Cartão
                        </h4>
                        <p className="text-xs text-zinc-300">
                          Cobrança automatizada pelo gateway seguro do Mercado Pago.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0A0618] border border-purple-500/20 text-xs text-zinc-300 space-y-2">
                      <div className="flex justify-between">
                        <span>Plano Escolhido:</span>
                        <strong className="text-white">{isPro ? 'Vice Clipper PRO' : 'Vice Clipper'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Periodicidade:</span>
                        <strong className="text-white">{billingCycle === 'annual' ? 'Anual' : 'Mensal'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Parcelamento:</span>
                        <span className="text-emerald-400 font-semibold">Em até 12x no cartão</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCardCheckout}
                      disabled={isProcessing}
                      className="w-full py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#009ee3] via-[#0081ba] to-vice-purple hover:opacity-95 shadow-[0_0_25px_rgba(0,158,227,0.4)] transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 mt-2"
                    >
                      <Lock className="w-4 h-4 text-white" />
                      <span>
                        {isProcessing
                          ? 'Iniciando Sessão Segura no Mercado Pago...'
                          : `Continuar para Mercado Pago • R$ ${currentPrice},00`}
                      </span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <p className="text-[11px] text-center text-zinc-400">
                      Você será redirecionado para a página oficial do Mercado Pago para autorizar o cartão.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] sticky top-24">
                <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-purple-500/15">
                  Resumo da Assinatura
                </h3>

                {/* Plan Selector Toggle */}
                <div className="flex flex-col gap-2.5 mb-5">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Plano Escolhido:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanId('vice-clipper');
                        setPixData(null);
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                        selectedPlanId === 'vice-clipper'
                          ? 'bg-vice-purple/20 border-vice-pink text-white shadow-[0_0_10px_rgba(255,20,147,0.3)]'
                          : 'bg-[#151027] border-purple-500/20 text-vice-textMuted hover:text-white'
                      }`}
                    >
                      <div>Vice Clipper</div>
                      <div className="text-[10px] text-vice-blue mt-0.5">
                        {billingCycle === 'annual' ? 'R$ 25/mês' : 'R$ 30/mês'}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanId('vice-clipper-pro');
                        setPixData(null);
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-left relative cursor-pointer ${
                        selectedPlanId === 'vice-clipper-pro'
                          ? 'bg-vice-pink/20 border-vice-pink text-white shadow-[0_0_10px_rgba(255,20,147,0.3)]'
                          : 'bg-[#151027] border-purple-500/20 text-vice-textMuted hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>Vice Clipper PRO</span>
                        <Crown className="w-3 h-3 text-vice-pink" />
                      </div>
                      <div className="text-[10px] text-vice-pink mt-0.5">
                        {billingCycle === 'annual' ? 'R$ 45/mês' : 'R$ 50/mês'}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Billing Cycle Selector */}
                <div className="flex flex-col gap-2.5 mb-6">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Ciclo de Cobrança:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBillingCycle('monthly');
                        setPixData(null);
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        billingCycle === 'monthly'
                          ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white'
                          : 'bg-[#151027] border-purple-500/20 text-vice-textMuted hover:text-white'
                      }`}
                    >
                      Mensal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBillingCycle('annual');
                        setPixData(null);
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        billingCycle === 'annual'
                          ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white'
                          : 'bg-[#151027] border-purple-500/20 text-vice-textMuted hover:text-white'
                      }`}
                    >
                      Anual (- R$ 60/ano)
                    </button>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="bg-[#151027] p-4 rounded-2xl border border-purple-500/15 mb-6 text-xs space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-vice-pink" />
                    <span>Benefícios inclusos no plano:</span>
                  </div>
                  <div className="text-zinc-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-vice-blue shrink-0" />
                    <span>Trend Radar de GTA 6 em tempo real</span>
                  </div>
                  <div className="text-zinc-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-vice-blue shrink-0" />
                    <span>
                      {isPro ? 'Clipes inteligentes ILIMITADOS' : 'Até 40 clipes inteligentes/mês'}
                    </span>
                  </div>
                  <div className="text-zinc-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-vice-blue shrink-0" />
                    <span>{isPro ? 'Exportação Ultra HD 4K 60FPS' : 'Exportação Full HD 1080p'}</span>
                  </div>
                  <div className="text-zinc-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-vice-blue shrink-0" />
                    <span>Sem marca d’água e com enquadramento 9:16</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs text-zinc-300 pb-4 border-b border-purple-500/15">
                  <div className="flex justify-between">
                    <span>Preço Oficial do Banco</span>
                    <span>R$ {currentPrice},00</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <div className="flex justify-between text-vice-pink font-semibold">
                      <span>Desconto Anual Aplicado</span>
                      <span>- R$ 60,00</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-400">
                    <span>Taxa de Processamento PIX/MP</span>
                    <span>GRÁTIS</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-4">
                  <span className="text-sm font-bold text-white">Total a Pagar</span>
                  <div className="text-right">
                    <div className="text-2xl font-black font-display text-white">
                      R$ {currentPrice},00
                    </div>
                    <div className="text-[11px] text-vice-textMuted">
                      {billingCycle === 'annual'
                        ? 'Cobrança anual com desconto'
                        : 'Renovação mensal'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/10 p-6 text-center text-xs text-vice-textMuted bg-[#070611]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 VICE CLIPPER • Gateway Oficial Mercado Pago</div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/planos" className="hover:text-white">Planos</Link>
            <span>•</span>
            <Link href="/login" className="hover:text-white">Login</Link>
            <span>•</span>
            <Link href="/" className="hover:text-white">Início</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070611] text-white flex items-center justify-center">
          Carregando checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
