'use client';

import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Code,
  RefreshCw,
  Send,
} from 'lucide-react';
import { Input, Modal, Tag, message, Button } from 'antd';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { WebhookEventRecord } from '@/types/saas';

export default function AdminLogsPage() {
  const [events, setEvents] = useState<WebhookEventRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Inspection modal
  const [selectedEvent, setSelectedEvent] = useState<WebhookEventRecord | null>(null);
  const [payloadModalOpen, setPayloadModalOpen] = useState(false);

  // Live Simulator Form
  const [provider, setProvider] = useState<'mercadopago' | 'pix' | 'stripe'>('pix');
  const [eventId, setEventId] = useState(`evt_sim_${Date.now()}`);
  const [email, setEmail] = useState('criador.leonida@gmail.com');
  const [planSlug, setPlanSlug] = useState('vice-clipper-pro-annual');
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInspect = (evt: WebhookEventRecord) => {
    setSelectedEvent(evt);
    setPayloadModalOpen(true);
  };

  const handleFireWebhook = async () => {
    if (!email || !eventId) {
      message.error('Preencha os campos obrigatórios do simulador.');
      return;
    }

    setIsSimulating(true);
    try {
      const res = await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          provider_event_id: eventId,
          event_type: 'payment.success',
          user_email: email,
          user_name: 'Criador Leonida Teste',
          plan_slug: planSlug,
          amount_cents: planSlug.includes('pro') ? 54000 : 30000,
          payment_method: provider === 'pix' ? 'pix' : 'credit_card',
          provider_payment_id: `pay_${eventId}`,
        }),
      });

      const data = await res.json();
      setLastResponse(data);

      if (res.ok && data.success) {
        if (data.duplicate) {
          message.warning('Idempotência acionada! O servidor ignorou a duplicação.');
        } else {
          message.success('Evento novo processado e plano ativado com sucesso!');
        }
        fetchEvents();
      } else {
        message.error(data.error || 'Erro no webhook.');
      }
    } catch (err: any) {
      message.error('Erro de conexão ao disparar.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleGenerateNewId = () => {
    setEventId(`evt_sim_${Date.now()}`);
    setLastResponse(null);
  };

  return (
    <div className="flex-1 flex flex-col select-none">
      <AdminHeader
        title="Webhooks & Monitor de Idempotência"
        subtitle="Auditoria de eventos recebidos dos gateways de pagamento e proteção contra duplicidade"
        onRefresh={fetchEvents}
      />

      <main className="p-6 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
        {/* Interactive Webhook Simulator */}
        <div className="bg-[#120B24] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(245,158,11,0.15)] relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Simulador de Eventos de Webhook (Testes de Idempotência)
                </h3>
                <p className="text-xs text-zinc-400">
                  Dispare webhooks em tempo real e teste a proteção contra cobranças duplicadas clicando duas vezes com o mesmo ID
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateNewId}
              className="text-xs font-semibold text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Gerar Novo Event ID</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
                Gateway / Provedor
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full bg-[#151027] border border-purple-500/30 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="pix">⚡ PIX Central Banco</option>
                <option value="mercadopago">💳 Mercado Pago</option>
                <option value="stripe">💳 Stripe Connect</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
                Provider Event ID (Idempotência)
              </label>
              <Input
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="bg-[#151027] border-purple-500/30 text-xs font-mono text-amber-300"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
                E-mail do Assinante
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#151027] border-purple-500/30 text-xs text-zinc-200"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
                Plano Comprado
              </label>
              <select
                value={planSlug}
                onChange={(e) => setPlanSlug(e.target.value)}
                className="w-full bg-[#151027] border border-purple-500/30 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="vice-clipper-pro-annual">Vice Clipper PRO Anual (R$ 540)</option>
                <option value="vice-clipper-annual">Vice Clipper Anual (R$ 300)</option>
                <option value="vice-clipper-pro-monthly">Vice Clipper PRO Mensal (R$ 50)</option>
                <option value="vice-clipper-monthly">Vice Clipper Mensal (R$ 30)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-purple-500/15">
            <div className="text-xs text-zinc-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Chave única: <code>{provider}:{eventId}</code></span>
            </div>

            <button
              onClick={handleFireWebhook}
              disabled={isSimulating}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-pink-600 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Disparando Webhook...' : 'Disparar Webhook POST'}</span>
            </button>
          </div>

          {lastResponse && (
            <div className="mt-4 p-4 rounded-2xl bg-[#090514] border border-purple-500/25">
              <div className="text-[11px] font-bold text-amber-300 mb-1">
                Resposta do Servidor ({lastResponse.duplicate ? 'IDEMPOTENTE' : 'NOVO EVENTO'}):
              </div>
              <pre className="text-[10px] font-mono text-zinc-300 overflow-x-auto">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Webhooks History Table */}
        <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="p-6 border-b border-purple-500/15 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Histórico de Eventos & Reconciliação</h3>
              <p className="text-xs text-zinc-400">
                Todos os webhooks processados com registro imutável para auditoria financeira
              </p>
            </div>
            <span className="text-xs text-zinc-400">
              Total de eventos: <strong className="text-white">{events.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-500/20 bg-[#151027] text-zinc-400 uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Identificador do Evento</th>
                  <th className="py-4 px-6">Gateway</th>
                  <th className="py-4 px-6">Tipo do Evento</th>
                  <th className="py-4 px-6">Resultado da Idempotência</th>
                  <th className="py-4 px-6">Data & Hora</th>
                  <th className="py-4 px-6 text-right">Inspecionar Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-zinc-500 text-xs">
                      Nenhum webhook registrado até o momento.
                    </td>
                  </tr>
                ) : (
                  events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-purple-900/10 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-amber-300">
                        {evt.provider_event_id}
                      </td>

                      <td className="py-3.5 px-6 font-semibold uppercase text-vice-blue">
                        {evt.provider}
                      </td>

                      <td className="py-3.5 px-6 font-mono text-zinc-300">
                        {evt.event_type}
                      </td>

                      <td className="py-3.5 px-6">
                        {evt.duplicate ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            ● DUPLICADO (IGNORADO)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ● PROCESSADO 200 OK
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 text-zinc-400">
                        {new Date(evt.processed_at).toLocaleString('pt-BR')}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleInspect(evt)}
                          className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-vice-blue text-vice-blue text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Code className="w-3.5 h-3.5" />
                          <span>Ver JSON</span>
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

      {/* JSON Payload Inspector Modal */}
      <Modal
        title={
          <span className="text-white font-bold flex items-center gap-2">
            <Code className="w-4 h-4 text-vice-blue" />
            <span>Payload do Webhook: {selectedEvent?.provider_event_id}</span>
          </span>
        }
        open={payloadModalOpen}
        onCancel={() => setPayloadModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPayloadModalOpen(false)}>
            Fechar
          </Button>,
          <Button
            key="copy"
            type="primary"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(selectedEvent?.payload, null, 2));
              message.success('JSON copiado com sucesso!');
            }}
            className="bg-vice-blue text-black font-bold"
          >
            Copiar JSON
          </Button>,
        ]}
      >
        <div className="py-3">
          <pre className="p-4 rounded-2xl bg-[#090514] border border-purple-500/30 text-xs font-mono text-zinc-300 max-h-96 overflow-y-auto">
            {JSON.stringify(selectedEvent?.payload, null, 2)}
          </pre>
        </div>
      </Modal>
    </div>
  );
}
