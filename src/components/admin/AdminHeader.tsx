'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Activity,
  Zap,
  RefreshCw,
  Bell,
  Search,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Modal, Input, message, Button } from 'antd';

export const AdminHeader: React.FC<{ title?: string; subtitle?: string; onRefresh?: () => void }> = ({
  title = 'Console Administrativo',
  subtitle = 'Painel executivo de monitoramento e gestão comercial',
  onRefresh,
}) => {
  const [testWebhookModal, setTestWebhookModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPlan, setTestPlan] = useState('vice-clipper-pro-annual');
  const [simulating, setSimulating] = useState(false);

  const handleSimulateWebhook = async () => {
    if (!testEmail) {
      message.error('Informe um e-mail para o teste.');
      return;
    }

    setSimulating(true);
    try {
      const paymentId = `pay_admin_sim_${Date.now()}`;
      const res = await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'pix',
          provider_event_id: `evt_${paymentId}`,
          event_type: 'payment.success',
          user_email: testEmail,
          user_name: 'Usuário Teste Admin',
          plan_slug: testPlan,
          amount_cents: testPlan.includes('pro') ? 54000 : 30000,
          payment_method: 'pix',
          provider_payment_id: paymentId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        message.success(`Webhook processado com sucesso para ${testEmail}!`);
        setTestWebhookModal(false);
        if (onRefresh) onRefresh();
      } else {
        message.error(data.error || 'Falha ao simular webhook.');
      }
    } catch (err: any) {
      message.error('Erro de conexão ao simular webhook.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <>
      <header className="h-20 bg-[#090514]/90 backdrop-blur-md border-b border-amber-500/15 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black font-display text-white tracking-tight">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sistemas Operacionais</span>
            </span>
          </div>
          <p className="text-xs text-zinc-400 hidden sm:block">{subtitle}</p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Recarregar Dados"
              className="p-2.5 rounded-xl bg-[#120B24] border border-amber-500/20 text-zinc-400 hover:text-white hover:border-amber-400/40 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setTestWebhookModal(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-pink-600 hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            <span>Simular Webhook PIX</span>
          </button>

          <Link
            href="/app"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-[#120B24] border border-purple-500/20 hover:text-white hover:bg-white/5 transition-colors"
          >
            App do Criador
          </Link>
        </div>
      </header>

      {/* Simulator Modal */}
      <Modal
        title={<span className="text-white font-bold">Simulador de Webhook de Pagamento</span>}
        open={testWebhookModal}
        onCancel={() => setTestWebhookModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setTestWebhookModal(false)}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={simulating}
            onClick={handleSimulateWebhook}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            Disparar Evento payment.success
          </Button>,
        ]}
      >
        <div className="py-3 text-xs text-zinc-300 space-y-3">
          <p>
            Dispara uma requisição de simulação ao endpoint <code>/api/webhooks/payment</code> com tratamento de idempotência e ativação de plano.
          </p>

          <div>
            <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
              E-mail do Cliente para Ativação:
            </label>
            <Input
              placeholder="cliente.novo@exemplo.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
              Plano a Ativar:
            </label>
            <select
              value={testPlan}
              onChange={(e) => setTestPlan(e.target.value)}
              className="w-full bg-[#120B24] border border-purple-500/30 rounded-lg p-2.5 text-xs text-white"
            >
              <option value="vice-clipper-pro-annual">Vice Clipper PRO Anual (R$ 540/ano)</option>
              <option value="vice-clipper-annual">Vice Clipper Anual (R$ 300/ano)</option>
              <option value="vice-clipper-pro-monthly">Vice Clipper PRO Mensal (R$ 50/mês)</option>
              <option value="vice-clipper-monthly">Vice Clipper Mensal (R$ 30/mês)</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
};
