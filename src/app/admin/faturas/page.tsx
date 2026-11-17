'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  ExternalLink,
  ShieldCheck,
  QrCode,
  CreditCard,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react';
import { Input, Select, Tag, message } from 'antd';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PaymentRecord, UserProfile, Plan } from '@/types/saas';

type EnrichedPayment = PaymentRecord & { user?: UserProfile; plan?: Plan };

export default function AdminFaturasPage() {
  const [payments, setPayments] = useState<EnrichedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/transactions');
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.provider_payment_id.toLowerCase().includes(q) ||
      p.user?.email.toLowerCase().includes(q) ||
      p.user?.full_name.toLowerCase().includes(q);

    const matchesMethod =
      methodFilter === 'all' || p.payment_method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const totalVolume = payments.reduce((acc, curr) => acc + curr.amount_cents, 0);
  const pixVolume = payments
    .filter((p) => p.payment_method === 'pix')
    .reduce((acc, curr) => acc + curr.amount_cents, 0);
  const cardVolume = payments
    .filter((p) => p.payment_method === 'credit_card')
    .reduce((acc, curr) => acc + curr.amount_cents, 0);

  const formatBRL = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex-1 flex flex-col select-none">
      <AdminHeader
        title="Faturas & Transações do Gateway"
        subtitle="Auditoria de arrecadação, reconciliação bancária PIX e cobranças via cartão"
        onRefresh={fetchPayments}
      />

      <main className="p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#120B24] border border-amber-500/25 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-400 uppercase font-semibold">Total Geral Faturado</div>
              <div className="text-2xl font-black text-white">{formatBRL(totalVolume)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#120B24] border border-emerald-500/25 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-400 uppercase font-semibold">Arrecadação PIX</div>
              <div className="text-2xl font-black text-emerald-400">{formatBRL(pixVolume)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#120B24] border border-purple-500/25 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-400 uppercase font-semibold">Cartão de Crédito</div>
              <div className="text-2xl font-black text-vice-pink">{formatBRL(cardVolume)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-vice-pink/15 text-vice-pink flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#120B24] border border-purple-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              size="large"
              placeholder="Buscar por ID de pagamento ou cliente..."
              prefix={<Search className="w-4 h-4 text-zinc-500 mr-2" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0A0618] border-purple-500/20 text-xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              size="large"
              value={methodFilter}
              onChange={setMethodFilter}
              className="w-48"
              options={[
                { value: 'all', label: 'Todas as Formas' },
                { value: 'pix', label: '⚡ Somente PIX' },
                { value: 'credit_card', label: '💳 Somente Cartão' },
              ]}
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-500/20 bg-[#151027] text-zinc-400 uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Identificador do Gateway</th>
                  <th className="py-4 px-6">Cliente / E-mail</th>
                  <th className="py-4 px-6">Plano</th>
                  <th className="py-4 px-6">Método</th>
                  <th className="py-4 px-6">Valor</th>
                  <th className="py-4 px-6">Data & Hora</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Comprovante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-zinc-500 text-xs">
                      Nenhuma transação registrada.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-purple-900/10 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-zinc-300">
                        {p.provider_payment_id}
                      </td>

                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-white">
                          {p.user?.full_name || 'Cliente'}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {p.user?.email || '—'}
                        </div>
                      </td>

                      <td className="py-3.5 px-6 text-zinc-300 font-medium">
                        {p.plan?.name || 'Assinatura SaaS'}
                      </td>

                      <td className="py-3.5 px-6">
                        <span className="font-bold text-vice-blue flex items-center gap-1.5 uppercase">
                          {p.payment_method === 'pix' ? (
                            <>
                              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                              <span>PIX</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3.5 h-3.5 text-vice-pink" />
                              <span>Cartão</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 font-black text-white">
                        {formatBRL(p.amount_cents)}
                      </td>

                      <td className="py-3.5 px-6 text-zinc-400">
                        {new Date(p.paid_at || p.created_at).toLocaleString('pt-BR')}
                      </td>

                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ● PAGO
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => message.info(`Comprovante fiscal ${p.provider_payment_id} copiado para a área de transferência.`)}
                          className="text-amber-400 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Recibo</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
