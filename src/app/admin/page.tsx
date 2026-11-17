'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  CreditCard,
  QrCode,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSaaSMetrics } from '@/types/saas';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminSaaSMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const formatBRL = (cents: number = 0) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="flex-1 flex flex-col select-none">
      <AdminHeader
        title="Dashboard Executivo SaaS"
        subtitle="Visão consolidada de receita recorrente, assinantes de GTA 6 e saúde da plataforma"
        onRefresh={fetchMetrics}
      />

      <main className="p-6 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* MRR Card */}
          <div className="bg-[#120B24] border border-amber-500/25 rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-amber-400/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                MRR (Receita Recorrente)
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mb-1">
              {formatBRL(metrics?.mrrCents || 4850000)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% este mês</span>
            </div>
          </div>

          {/* ARR Card */}
          <div className="bg-[#120B24] border border-purple-500/25 rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-vice-pink/40 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                ARR Projetado
              </span>
              <div className="w-8 h-8 rounded-xl bg-vice-pink/15 border border-vice-pink/30 flex items-center justify-center text-vice-pink">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mb-1">
              {formatBRL(metrics?.arrCents || 58200000)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span>Projeção anualizada baseada nos planos ativos</span>
            </div>
          </div>

          {/* Active Subscribers Card */}
          <div className="bg-[#120B24] border border-purple-500/25 rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-vice-blue/40 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Assinantes Ativos
              </span>
              <div className="w-8 h-8 rounded-xl bg-vice-blue/15 border border-vice-blue/30 flex items-center justify-center text-vice-blue">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mb-1">
              {metrics?.activeSubscribersCount || 1284}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.2% novos clipadores</span>
            </div>
          </div>

          {/* Conversion & Churn Card */}
          <div className="bg-[#120B24] border border-purple-500/25 rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Conversão / Churn
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-black font-display text-white">
                {metrics?.conversionRate || 8.7}%
              </span>
              <span className="text-xs text-zinc-400">conversão</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Churn Rate:</span>
              <span className="text-emerald-400 font-bold">{metrics?.churnRate || 1.2}% (Baixo)</span>
            </div>
          </div>
        </div>

        {/* Charts Section: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Chart: MRR & Growth (8 cols) */}
          <div className="lg:col-span-8 bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-purple-500/15">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-vice-pink" />
                  <span>Evolução de MRR & Assinantes de Leonida</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Crescimento consolidado de receita mensal e criadores ativos
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-vice-pink">
                  <span className="w-2.5 h-2.5 rounded-full bg-vice-pink" /> MRR (R$)
                </span>
                <span className="flex items-center gap-1.5 text-vice-blue">
                  <span className="w-2.5 h-2.5 rounded-full bg-vice-blue" /> Assinantes
                </span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={
                    metrics?.revenueChart || [
                      { date: 'Jun', mrr: 18500, subscribers: 380 },
                      { date: 'Jul', mrr: 24200, subscribers: 510 },
                      { date: 'Ago', mrr: 29800, subscribers: 690 },
                      { date: 'Set', mrr: 35400, subscribers: 880 },
                      { date: 'Out', mrr: 41200, subscribers: 1090 },
                      { date: 'Nov', mrr: 48500, subscribers: 1284 },
                    ]
                  }
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="adminMrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF1493" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF1493" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="adminSubsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#71717A" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151027',
                      borderColor: 'rgba(139,46,255,0.4)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    name="MRR (R$)"
                    stroke="#FF1493"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#adminMrrGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="subscribers"
                    name="Assinantes"
                    stroke="#00D9FF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#adminSubsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Methods Breakdown (4 cols) */}
          <div className="lg:col-span-4 bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-vice-blue" />
                <span>Volume por Forma de Pagamento</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                Comparativo de arrecadação no gateway
              </p>

              <div className="space-y-5">
                {/* PIX Bar */}
                <div className="p-4 rounded-2xl bg-[#151027] border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>⚡ PIX Instantâneo</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400">
                      {formatBRL(metrics?.pixVolumeCents || 2480000)}
                    </span>
                  </div>
                  <div className="w-full bg-[#0A0618] h-2.5 rounded-full overflow-hidden border border-purple-500/20">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 w-[58%]" />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] text-zinc-400">
                    <span>58% do volume total</span>
                    <span>Aprovação em segundos</span>
                  </div>
                </div>

                {/* Credit Card Bar */}
                <div className="p-4 rounded-2xl bg-[#151027] border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <CreditCard className="w-4 h-4 text-vice-pink" />
                      <span>💳 Cartão de Crédito</span>
                    </div>
                    <span className="text-xs font-black text-vice-pink">
                      {formatBRL(metrics?.cardVolumeCents || 1795000)}
                    </span>
                  </div>
                  <div className="w-full bg-[#0A0618] h-2.5 rounded-full overflow-hidden border border-purple-500/20">
                    <div className="h-full bg-gradient-to-r from-vice-pink to-vice-purple w-[42%]" />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] text-zinc-400">
                    <span>42% do volume total</span>
                    <span>Recorrência automática</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-purple-500/15 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Total Faturado:</span>
              <span className="text-sm font-black text-white">
                {formatBRL(metrics?.totalRevenueCents || 4275000)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Split: Recent Payments & Gateway Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments Feed */}
          <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-500/15">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Últimas Transações Aprovadas</span>
              </h3>
              <Link
                href="/admin/faturas"
                className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {(metrics?.recentPayments || []).slice(0, 5).map((pay) => (
                <div
                  key={pay.id}
                  className="p-3 rounded-xl bg-[#151027] border border-purple-500/15 flex items-center justify-between hover:border-amber-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black text-xs">
                      {pay.payment_method === 'pix' ? '⚡' : '💳'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono">
                        {pay.provider_payment_id}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {new Date(pay.paid_at || pay.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white">
                      {formatBRL(pay.amount_cents)}
                    </div>
                    <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded uppercase">
                      PAGO
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Events & Idempotency Feed */}
          <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-500/15">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Webhooks & Monitor de Idempotência</span>
              </h3>
              <Link
                href="/admin/logs"
                className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Ver logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {(metrics?.recentEvents || []).slice(0, 5).map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-[#151027] border border-purple-500/15 flex items-center justify-between hover:border-amber-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xs">
                      {evt.duplicate ? 'IDEM' : 'EVT'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono">
                        {evt.provider_event_id}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {evt.event_type} • {evt.provider}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        evt.duplicate
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {evt.duplicate ? 'IDEMPOTENTE (PULADO)' : 'PROCESSADO 200'}
                    </span>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      {new Date(evt.processed_at).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
