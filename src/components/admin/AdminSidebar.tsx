'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Sliders,
  Terminal,
  ArrowLeft,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ViceLogo } from '../ui/ViceLogo';
import { useAuth } from '@/context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    {
      href: '/admin',
      label: 'Visão Geral & SaaS',
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: 'LIVE',
    },
    {
      href: '/admin/usuarios',
      label: 'Usuários & Assinantes',
      icon: <Users className="w-5 h-5" />,
    },
    {
      href: '/admin/faturas',
      label: 'Faturas & Pagamentos',
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      href: '/admin/planos',
      label: 'Planos & Precificação',
      icon: <Sliders className="w-5 h-5" />,
    },
    {
      href: '/admin/logs',
      label: 'Webhooks & Idempotência',
      icon: <Terminal className="w-5 h-5" />,
      badge: 'GATEWAY',
    },
  ];

  return (
    <aside className="w-64 bg-[#090514] border-r border-amber-500/20 min-h-screen flex flex-col justify-between p-4 sticky top-0 h-screen overflow-y-auto select-none z-30 shadow-[4px_0_25px_rgba(0,0,0,0.5)]">
      {/* Top Header & Logo */}
      <div className="flex flex-col gap-6">
        <div className="pt-2 px-1 pb-3 border-b border-amber-500/15">
          <Link href="/admin" className="inline-block">
            <ViceLogo size="sm" />
          </Link>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black tracking-wider uppercase">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Admin Console Hub</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 mb-1">
            Gestão da Plataforma
          </div>

          {navLinks.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-amber-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      isActive
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick App Navigation */}
        <div className="flex flex-col gap-1.5 pt-4 border-t border-purple-500/15">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 mb-1">
            Atalhos do Sistema
          </div>

          <Link
            href="/app"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-vice-blue hover:text-white hover:bg-vice-blue/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao App do Usuário</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-vice-pink" />
              <span>Ver Landing Page</span>
            </div>
            <span className="text-[10px] text-zinc-600">/</span>
          </Link>
        </div>
      </div>

      {/* Admin User Profile Footer */}
      <div className="pt-4 border-t border-amber-500/15 flex flex-col gap-3">
        <div className="bg-[#120B24] border border-amber-500/25 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/30 to-purple-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-sm shrink-0">
              {user?.full_name ? user.full_name[0] : 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">
                {user?.full_name || 'Admin Leonida'}
              </div>
              <div className="text-[10px] text-amber-400 font-semibold uppercase flex items-center gap-1">
                <span>Super Admin</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Encerrar Sessão"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
