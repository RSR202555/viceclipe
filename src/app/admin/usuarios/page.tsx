'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Crown,
  Edit,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Input, Select, Modal, Tag, Button, message } from 'antd';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminUserListItem } from '@/types/saas';

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Modal editing state
  const [selectedItem, setSelectedItem] = useState<AdminUserListItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPlanSlug, setEditPlanSlug] = useState('vice-clipper-pro-annual');
  const [editStatus, setEditStatus] = useState<'active' | 'canceled' | 'past_due'>('active');
  const [extendMonths, setExtendMonths] = useState<number>(12);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEdit = (item: AdminUserListItem) => {
    setSelectedItem(item);
    setEditPlanSlug(item.plan?.slug || 'vice-clipper-pro-annual');
    setEditStatus((item.subscription?.status as any) || 'active');
    setExtendMonths(12);
    setEditModalOpen(true);
  };

  const handleSaveSubscription = async () => {
    if (!selectedItem) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_subscription',
          userId: selectedItem.user.id,
          planSlug: editPlanSlug,
          status: editStatus,
          extendMonths,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        message.success(data.message);
        setEditModalOpen(false);
        fetchUsers();
      } else {
        message.error(data.error || 'Erro ao atualizar assinatura.');
      }
    } catch (err) {
      message.error('Erro de conexão ao salvar.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAdmin = async (item: AdminUserListItem) => {
    try {
      const newAdminState = !item.user.is_admin;
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_admin',
          userId: item.user.id,
          isAdmin: newAdminState,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        message.success(`Status de administrador alterado para ${item.user.full_name}!`);
        fetchUsers();
      }
    } catch (err) {
      message.error('Erro ao alterar cargo.');
    }
  };

  // Filtered users
  const filteredUsers = users.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.user.full_name.toLowerCase().includes(q) ||
      item.user.username.toLowerCase().includes(q) ||
      item.user.email.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.subscription?.status === 'active') ||
      (statusFilter === 'canceled' && item.subscription?.status === 'canceled') ||
      (statusFilter === 'none' && !item.subscription);

    const matchesPlan =
      planFilter === 'all' ||
      (planFilter === 'pro' && item.plan?.slug?.includes('pro')) ||
      (planFilter === 'basic' && item.plan?.slug?.includes('clipper') && !item.plan?.slug?.includes('pro')) ||
      (planFilter === 'none' && !item.plan);

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalUsers = users.length;
  const activeSubs = users.filter((u) => u.subscription?.status === 'active').length;
  const totalRevenue = users.reduce((acc, curr) => acc + curr.totalSpentCents, 0);

  return (
    <div className="flex-1 flex flex-col select-none">
      <AdminHeader
        title="Gestão de Usuários & Assinantes"
        subtitle="Controle de acessos, concessão de planos manuais e privilégios administrativos"
        onRefresh={fetchUsers}
      />

      <main className="p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Statistics Pill Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#120B24] border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-400 uppercase font-semibold">Total de Criadores</div>
              <div className="text-2xl font-black text-white">{totalUsers}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#120B24] border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-400 uppercase font-semibold">Assinaturas Ativas</div>
              <div className="text-2xl font-black text-emerald-400">{activeSubs}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#120B24] border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-400 uppercase font-semibold">Arrecadação Acumulada</div>
              <div className="text-2xl font-black text-vice-pink">
                {(totalRevenue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-vice-pink/15 text-vice-pink flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#120B24] border border-purple-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <Input
              size="large"
              placeholder="Buscar por nome, username ou e-mail..."
              prefix={<Search className="w-4 h-4 text-zinc-500 mr-2" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0A0618] border-purple-500/20 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Select
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-40"
              options={[
                { value: 'all', label: 'Todos os Status' },
                { value: 'active', label: '● Ativos' },
                { value: 'canceled', label: '● Cancelados' },
                { value: 'none', label: 'Sem Assinatura' },
              ]}
            />

            <Select
              size="large"
              value={planFilter}
              onChange={setPlanFilter}
              className="w-44"
              options={[
                { value: 'all', label: 'Todos os Planos' },
                { value: 'pro', label: 'Vice Clipper PRO' },
                { value: 'basic', label: 'Vice Clipper Plus' },
                { value: 'none', label: 'Sem Plano Ativo' },
              ]}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-500/20 bg-[#151027] text-zinc-400 uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Usuário / Gamertag</th>
                  <th className="py-4 px-6">E-mail</th>
                  <th className="py-4 px-6">Plano Atual</th>
                  <th className="py-4 px-6">Status da Assinatura</th>
                  <th className="py-4 px-6">Total Pago</th>
                  <th className="py-4 px-6">Cargo</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-zinc-500 text-xs">
                      Nenhum usuário encontrado para os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((item) => (
                    <tr key={item.user.id} className="hover:bg-purple-900/10 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-vice-pink/30 to-purple-600/30 border border-purple-500/30 flex items-center justify-center font-bold text-white uppercase shrink-0">
                            {item.user.full_name[0] || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{item.user.full_name}</span>
                              {item.user.is_admin && (
                                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-vice-blue font-mono">
                              @{item.user.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-6 font-mono text-zinc-300">
                        {item.user.email}
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-6">
                        {item.plan ? (
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            {item.plan.slug.includes('pro') && (
                              <Crown className="w-3.5 h-3.5 text-vice-pink shrink-0" />
                            )}
                            <span>{item.plan.name}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-500 italic">Nenhum</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-6">
                        {item.subscription?.status === 'active' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ● ATIVA
                          </span>
                        ) : item.subscription?.status === 'canceled' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            ● CANCELADA
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-zinc-800 text-zinc-400 border border-zinc-700">
                            INATIVO
                          </span>
                        )}
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-6 font-bold text-white">
                        {(item.totalSpentCents / 100).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>

                      {/* Role Toggle */}
                      <td className="py-3.5 px-6">
                        <button
                          onClick={() => handleToggleAdmin(item)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                            item.user.is_admin
                              ? 'bg-amber-400/15 border-amber-400/40 text-amber-300 hover:bg-amber-400/25'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {item.user.is_admin ? '★ Super Admin' : 'Usuário Normal'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-amber-400 text-amber-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Gerenciar</span>
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

      {/* Edit User Subscription Modal */}
      <Modal
        title={
          <span className="text-white font-bold flex items-center gap-2">
            <Edit className="w-4 h-4 text-amber-400" />
            <span>Gerenciar Assinatura de {selectedItem?.user.full_name}</span>
          </span>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setEditModalOpen(false)}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isUpdating}
            onClick={handleSaveSubscription}
            className="bg-gradient-to-r from-amber-500 to-pink-600 text-white font-bold"
          >
            Salvar Alterações
          </Button>,
        ]}
      >
        <div className="py-3 space-y-4 text-xs text-zinc-300">
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
              Atribuir Plano:
            </label>
            <select
              value={editPlanSlug}
              onChange={(e) => setEditPlanSlug(e.target.value)}
              className="w-full bg-[#120B24] border border-purple-500/30 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="vice-clipper-pro-annual">Vice Clipper PRO Anual (R$ 540/ano)</option>
              <option value="vice-clipper-annual">Vice Clipper Anual (R$ 300/ano)</option>
              <option value="vice-clipper-pro-monthly">Vice Clipper PRO Mensal (R$ 50/mês)</option>
              <option value="vice-clipper-monthly">Vice Clipper Mensal (R$ 30/mês)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
              Status da Assinatura:
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as any)}
              className="w-full bg-[#120B24] border border-purple-500/30 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="active">● Ativa (Acesso Total Liberado)</option>
              <option value="canceled">● Cancelada (Acesso até fim do ciclo)</option>
              <option value="past_due">● Pagamento Pendente / Atrasado</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
              Estender Validade (Meses de Cortesia):
            </label>
            <select
              value={extendMonths}
              onChange={(e) => setExtendMonths(Number(e.target.value))}
              className="w-full bg-[#120B24] border border-purple-500/30 rounded-xl p-2.5 text-xs text-white"
            >
              <option value={1}>+1 Mês de Acesso</option>
              <option value={3}>+3 Meses de Acesso</option>
              <option value={6}>+6 Meses de Acesso</option>
              <option value={12}>+12 Meses (1 Ano de Cortesia)</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
