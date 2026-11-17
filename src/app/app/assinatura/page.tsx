'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Crown,
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Zap,
  RefreshCw,
  FileText,
  Clock,
} from 'lucide-react';
import { Modal, message, Tag, Button } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { PaymentRecord, Subscription, Plan } from '@/types/saas';

export default function AssinaturaPage() {
  const { user, subscription, plan, hasAccess, refreshSession } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Fetch subscription and payment history
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/subscription');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        message.success(data.message);
        setCancelModalOpen(false);
        await refreshSession();
        await loadData();
      } else {
        message.error(data.error || 'Erro ao cancelar assinatura.');
      }
    } catch (err) {
      message.error('Erro de conexão ao cancelar.');
    } finally {
      setIsCanceling(false);
    }
  };

  const isPro = plan?.slug?.includes('pro');
  const isAnnual = plan?.billing_interval === 'annual';
  const periodEndFormatted = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-purple-500/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-tight">
              Minha Assinatura & Faturamento
            </h1>
            <span className="bg-vice-pink/15 text-vice-pink text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-vice-pink/30 flex items-center gap-1">
              <Crown className="w-3 h-3" /> SaaS Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-vice-textMuted">
            Gerencie seu plano ativo, veja o histórico de faturas e configure métodos de pagamento.
          </p>
        </div>

        <Link
          href="/planos"
          className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(255,20,147,0.35)] flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Trocar ou Fazer Upgrade</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Plan Card (2 cols) */}
        <div className="lg:col-span-2 bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-vice-pink/20 to-vice-purple/20 border border-vice-pink/30 flex items-center justify-center text-vice-pink">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-display text-white uppercase">
                    {plan?.name || (hasAccess ? 'Vice Clipper PRO' : 'Sem Plano Ativo')}
                  </h2>
                  <div className="text-xs text-vice-textMuted">
                    {plan?.tagline || 'Sua assinatura comercial no VICE CLIPPER'}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              {subscription?.status === 'active' ? (
                <Tag color="success" className="px-3 py-1 font-bold rounded-full text-xs">
                  ● ATIVA
                </Tag>
              ) : subscription?.status === 'canceled' ? (
                <Tag color="warning" className="px-3 py-1 font-bold rounded-full text-xs">
                  ● CANCELADA (Acesso até o fim do ciclo)
                </Tag>
              ) : (
                <Tag color="error" className="px-3 py-1 font-bold rounded-full text-xs">
                  ● PENDENTE / EXPIRADA
                </Tag>
              )}
            </div>

            {/* Plan Info Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
              <div className="bg-[#151027] border border-purple-500/15 p-3.5 rounded-2xl">
                <div className="text-[11px] text-vice-textMuted mb-0.5">Valor do Plano</div>
                <div className="text-base font-black text-white">
                  R$ {plan ? (plan.price_cents / 100).toFixed(2).replace('.', ',') : '50,00'}
                  <span className="text-xs text-zinc-400 font-normal">
                    {isAnnual ? '/ano' : '/mês'}
                  </span>
                </div>
              </div>

              <div className="bg-[#151027] border border-purple-500/15 p-3.5 rounded-2xl">
                <div className="text-[11px] text-vice-textMuted mb-0.5">Ciclo de Cobrança</div>
                <div className="text-base font-bold text-white capitalize">
                  {isAnnual ? 'Anual (Econômico)' : 'Mensal Recorrente'}
                </div>
              </div>

              <div className="bg-[#151027] border border-purple-500/15 p-3.5 rounded-2xl">
                <div className="text-[11px] text-vice-textMuted mb-0.5">Próxima Renovação</div>
                <div className="text-base font-bold text-vice-blue">{periodEndFormatted}</div>
              </div>
            </div>

            {/* Cancel at period end notice */}
            {subscription?.cancel_at_period_end && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Você cancelou a renovação automática. Seu acesso às ferramentas continuará disponível até {periodEndFormatted}.
                </span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-purple-500/15 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-vice-textMuted flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantia de acesso e pagamentos seguros</span>
            </div>

            <div className="flex items-center gap-2">
              {!subscription?.cancel_at_period_end && subscription?.status === 'active' && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                >
                  Cancelar Renovação
                </button>
              )}

              <Link
                href="/checkout?plano=pro"
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#1A1233] hover:bg-purple-900/40 border border-purple-500/30 transition-colors flex items-center gap-1"
              >
                <span>Fazer Upgrade</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quota & Limits Card (1 col) */}
        <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-purple-500/15 flex items-center gap-2">
              <Zap className="w-4 h-4 text-vice-pink" />
              <span>Limites & Recursos</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1.5 text-zinc-300">
                  <span>Criação de Clipes este mês</span>
                  <span className="font-bold text-vice-pink">
                    {isPro ? 'ILIMITADO (PRO)' : '18 / 40 clipes'}
                  </span>
                </div>
                <div className="w-full bg-[#151027] h-2 rounded-full overflow-hidden border border-purple-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-vice-pink to-vice-purple rounded-full"
                    style={{ width: isPro ? '100%' : '45%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5 text-zinc-300">
                  <span>Resolução Máxima de Exportação</span>
                  <span className="font-bold text-vice-blue">
                    {isPro ? 'Ultra HD 4K (60 FPS)' : 'Full HD 1080p'}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5 text-zinc-300">
                  <span>Fila de Renderização</span>
                  <span className="font-bold text-emerald-400">
                    {isPro ? 'Prioritária Ultrarrápida' : 'Padrão'}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5 text-zinc-300">
                  <span>Marca D’água</span>
                  <span className="font-bold text-white">Sem Marca d’água</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-purple-900/15 rounded-xl border border-purple-500/20 text-[11px] text-vice-textMuted">
            Precisa de mais cortes ou renderização com IA dedicada? Nosso plano PRO oferece acesso sem limites.
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-purple-500/15">
          <div>
            <h3 className="text-lg font-bold text-white">Histórico de Faturas & Pagamentos</h3>
            <p className="text-xs text-vice-textMuted">
              Todos os pagamentos confirmados com recibos e comprovantes disponíveis para download.
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-[#151027] border border-purple-500/20 text-vice-textMuted hover:text-white hover:border-vice-pink/40 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-10 text-xs text-vice-textMuted">
            <FileText className="w-8 h-8 text-purple-400/30 mx-auto mb-2" />
            <p>Nenhuma fatura registrada anteriormente para este usuário.</p>
            <p className="mt-1">
              Assine um plano para liberar seu acesso imediatamente.{' '}
              <Link href="/planos" className="text-vice-pink font-semibold hover:underline">
                Ver Planos →
              </Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-500/20 text-zinc-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Identificador</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Forma de Pagamento</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Comprovante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-purple-900/10 transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-300">
                      {p.provider_payment_id}
                    </td>
                    <td className="py-3 px-4 text-zinc-300">
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 uppercase text-vice-blue font-semibold">
                      {p.payment_method === 'pix' ? '⚡ PIX' : '💳 Cartão de Crédito'}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      R$ {(p.amount_cents / 100).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        PAGO
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => message.info(`Recibo do pagamento ${p.provider_payment_id} gerado com sucesso.`)}
                        className="text-vice-pink hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Visualizar Recibo</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        title={<span className="text-white font-bold">Confirmar Cancelamento de Assinatura</span>}
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setCancelModalOpen(false)}>
            Manter Minha Assinatura
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={isCanceling}
            onClick={handleCancelSubscription}
          >
            Confirmar Cancelamento
          </Button>,
        ]}
      >
        <div className="py-3 text-xs text-vice-textMuted space-y-2">
          <p>
            Tem certeza de que deseja cancelar a renovação da sua assinatura do{' '}
            <strong className="text-white">{plan?.name || 'VICE CLIPPER'}</strong>?
          </p>
          <p>
            Você continuará com acesso total a todas as funcionalidades até{' '}
            <strong className="text-vice-pink">{periodEndFormatted}</strong>. Após essa data, o acesso às ferramentas internas será suspenso.
          </p>
        </div>
      </Modal>
    </div>
  );
}
