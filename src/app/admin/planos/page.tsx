'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Crown,
  Edit,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { Modal, Input, message, Button, Switch } from 'antd';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Plan } from '@/types/saas';

export default function AdminPlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [priceCents, setPriceCents] = useState(3000);
  const [clipsLimit, setClipsLimit] = useState(40);
  const [resolution, setResolution] = useState<'1080p' | '4k'>('1080p');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setPriceCents(plan.price_cents);
    setClipsLimit(plan.limits.clips_per_month);
    setResolution(plan.limits.max_resolution);
    setIsActive(plan.is_active);
    setEditModalOpen(true);
  };

  const handleSavePlan = async () => {
    if (!selectedPlan) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          updates: {
            price_cents: Number(priceCents),
            is_active: isActive,
            limits: {
              ...selectedPlan.limits,
              clips_per_month: Number(clipsLimit),
              max_resolution: resolution,
            },
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        message.success('Plano atualizado com sucesso!');
        setEditModalOpen(false);
        fetchPlans();
      } else {
        message.error(data.error || 'Erro ao atualizar plano.');
      }
    } catch (err) {
      message.error('Erro de conexão ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col select-none">
      <AdminHeader
        title="Planos & Precificação do SaaS"
        subtitle="Configuração de tabelas de preços, limites de geração de cortes e permissões da IA"
        onRefresh={fetchPlans}
      />

      <main className="p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {plans.map((plan) => {
            const isPro = plan.slug.includes('pro');
            const isAnnual = plan.billing_interval === 'annual';

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between border transition-all ${
                  isPro
                    ? 'bg-[#151027] border-vice-pink/40 shadow-[0_10px_35px_rgba(255,20,147,0.2)]'
                    : 'bg-[#120B24] border-purple-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black font-display text-white uppercase tracking-wide">
                        {plan.name}
                      </h3>
                      {isPro && <Crown className="w-4 h-4 text-vice-pink" />}
                    </div>

                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                        plan.is_active
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {plan.is_active ? 'ATIVO NO CHECKOUT' : 'PAUSADO'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mb-6">{plan.tagline}</p>

                  {/* Price info */}
                  <div className="p-4 rounded-2xl bg-[#0B0618] border border-purple-500/20 mb-6">
                    <div className="text-[11px] text-zinc-400 uppercase font-semibold">
                      Preço Configurado
                    </div>
                    <div className="text-3xl font-black text-white font-display mt-0.5">
                      R$ {(plan.price_cents / 100).toFixed(2).replace('.', ',')}
                      <span className="text-xs text-zinc-400 font-normal ml-1">
                        {isAnnual ? '/ano' : '/mês'}
                      </span>
                    </div>
                    <div className="text-[11px] text-vice-blue mt-1">
                      {isAnnual ? 'Cobrança Anual Recorrente' : 'Cobrança Mensal Recorrente'}
                    </div>
                  </div>

                  {/* Limits and Quotas */}
                  <div className="space-y-3 mb-6 text-xs text-zinc-300">
                    <div className="flex justify-between pb-2 border-b border-purple-500/10">
                      <span>Cortes Inteligentes por Mês:</span>
                      <span className="font-bold text-white">
                        {plan.limits.clips_per_month === -1
                          ? 'ILIMITADO (Sem travas)'
                          : `${plan.limits.clips_per_month} clipes`}
                      </span>
                    </div>

                    <div className="flex justify-between pb-2 border-b border-purple-500/10">
                      <span>Resolução Máxima:</span>
                      <span className="font-bold text-vice-pink uppercase">
                        {plan.limits.max_resolution} (60 FPS)
                      </span>
                    </div>

                    <div className="flex justify-between pb-2 border-b border-purple-500/10">
                      <span>Fila de Renderização Prioritária:</span>
                      <span className="font-bold text-emerald-400">
                        {plan.limits.priority_queue ? 'Sim (Ultra Rápida)' : 'Padrão'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="w-full py-3 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-amber-400 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar Parâmetros & Preço</span>
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Edit Modal */}
      <Modal
        title={
          <span className="text-white font-bold flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Editar Parâmetros do Plano {selectedPlan?.name}</span>
          </span>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalOpen(false)}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSaving}
            onClick={handleSavePlan}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            Salvar Alterações
          </Button>,
        ]}
      >
        <div className="py-3 space-y-4 text-xs text-zinc-300">
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
              Preço em Centavos (ex: 5000 = R$ 50,00 | 54000 = R$ 540,00):
            </label>
            <Input
              type="number"
              value={priceCents}
              onChange={(e) => setPriceCents(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
              Limite de Clipes por Mês (-1 para Ilimitado):
            </label>
            <Input
              type="number"
              value={clipsLimit}
              onChange={(e) => setClipsLimit(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
              Resolução Máxima:
            </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as any)}
              className="w-full bg-[#120B24] border border-purple-500/30 rounded-lg p-2 text-xs text-white"
            >
              <option value="1080p">Full HD (1080p)</option>
              <option value="4k">Ultra HD 4K (60 FPS)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-purple-500/15">
            <span>Disponível para Compra no Checkout:</span>
            <Switch checked={isActive} onChange={setIsActive} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
