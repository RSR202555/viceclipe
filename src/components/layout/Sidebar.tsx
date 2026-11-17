'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Tooltip } from 'antd';
import {
  Home,
  Compass,
  TrendingUp,
  Scissors,
  Users,
  MessageSquare,
  User,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  Crown,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { ViceLogo } from '../ui/ViceLogo';
import { useAuth } from '@/context/AuthContext';

export type NavTab =
  | 'inicio'
  | 'explorar'
  | 'em-alta'
  | 'trend-radar'
  | 'clipper'
  | 'criadores'
  | 'comunidade'
  | 'perfil'
  | 'assinatura'
  | 'admin';

interface SidebarProps {
  activeTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onOpenRegister?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenRegister,
  isDarkMode = true,
  onToggleTheme,
  collapsed = false,
}) => {
  const pathname = usePathname();
  const { user, subscription, plan, hasAccess } = useAuth();

  const isPro = plan?.slug?.includes('pro');
  const isAdmin = user?.is_admin || user?.email?.toLowerCase().endsWith('@viceclipper.com');

  const navItems = [
    {
      id: 'inicio' as NavTab,
      href: '/app',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'explorar' as NavTab,
      href: '/app/explorar',
      label: 'Explorar',
      icon: <Compass className="w-5 h-5" />,
    },
    {
      id: 'trend-radar' as NavTab,
      href: '/app/trend-radar',
      label: 'Trend Radar',
      icon: <TrendingUp className="w-5 h-5" />,
      badge: 'LIVE',
    },
    {
      id: 'clipper' as NavTab,
      href: '/app/clipper',
      label: 'AI Clipper',
      icon: <Scissors className="w-5 h-5" />,
      badge: 'IA',
    },
    {
      id: 'criadores' as NavTab,
      href: '/app/criadores',
      label: 'Criadores',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'comunidade' as NavTab,
      href: '/app/comunidade',
      label: 'Comunidade',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      id: 'perfil' as NavTab,
      href: '/app/perfil',
      label: 'Meu Perfil',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'assinatura' as NavTab,
      href: '/app/assinatura',
      label: 'Assinatura',
      icon: <Crown className="w-5 h-5 text-amber-400" />,
      badge: hasAccess ? (isPro ? 'PRO' : 'ATIVA') : 'SaaS',
    },
    ...(isAdmin
      ? [
          {
            id: 'admin' as NavTab,
            href: '/admin',
            label: 'Console Admin',
            icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
            badge: 'ADM',
          },
        ]
      : []),
  ];

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-[#0A0618] border-r border-[rgba(139,46,255,0.18)] min-h-screen flex flex-col justify-between p-4 sticky top-0 h-screen overflow-y-auto select-none z-30 transition-all duration-300`}
    >
      {/* Top Section: Logo & Navigation */}
      <div className="flex flex-col gap-6">
        {/* Logo Header */}
        <div className="pt-2 px-1 pb-2 border-b border-[rgba(139,46,255,0.12)]">
          <Link href="/" className="inline-block">
            <ViceLogo size={collapsed ? 'sm' : 'sm'} collapsed={collapsed} />
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/app' && pathname === '/app') ||
              (activeTab && activeTab === item.id);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onSelectTab && onSelectTab(item.id)}
                className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? item.id === 'admin'
                      ? 'bg-gradient-to-r from-amber-500/30 to-purple-600/30 border border-amber-500/40 text-amber-300 shadow-[0_4px_18px_rgba(245,158,11,0.3)]'
                      : 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_4px_18px_rgba(255,20,147,0.4)]'
                    : 'text-vice-textMuted hover:text-white hover:bg-[rgba(139,46,255,0.12)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors duration-200 ${
                      isActive
                        ? item.id === 'admin'
                          ? 'text-amber-400'
                          : 'text-white'
                        : 'text-vice-textMuted group-hover:text-vice-pink'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && <span className="font-medium tracking-wide">{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      isActive
                        ? 'bg-black/30 text-white'
                        : item.badge === 'ADM'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : item.badge === 'PRO' || item.badge === 'ATIVA'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : item.badge === 'IA'
                        ? 'bg-vice-blue/20 text-vice-blue border border-vice-blue/30'
                        : 'bg-vice-pink/20 text-vice-pink border border-vice-pink/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Subscription Card or Sign Up Promo Card */}
      {!collapsed && (
        <div className="flex flex-col gap-4 pt-4 border-t border-[rgba(139,46,255,0.15)]">
          {hasAccess ? (
            /* Active Subscription Info Card */
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-b from-[#181130] to-[#110A22] p-3 shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>{plan?.name || 'Assinatura Ativa'}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-extrabold">
                  ATIVA
                </span>
              </div>
              <p className="text-[11px] text-vice-textMuted mb-2.5">
                Acesso liberado ao Trend Radar e AI Clipper.
              </p>
              <Link
                href="/app/assinatura"
                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#221642] hover:bg-purple-900/40 border border-purple-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Gerenciar Plano</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            /* Sign Up / Subscribe Promo Card */
            <div className="relative rounded-2xl overflow-hidden border border-[rgba(139,46,255,0.25)] bg-[#120B24] p-3 shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
              <div className="relative w-full h-20 rounded-xl overflow-hidden mb-2.5 border border-purple-500/20">
                <Image
                  src="/images/sidebar-promo.png"
                  alt="Criar Conta no Vice Clipper"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120B24] via-transparent to-transparent" />
                <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-vice-blue flex items-center gap-1 font-semibold border border-vice-blue/30">
                  <Sparkles className="w-2.5 h-2.5" /> GTA 6 Hub
                </div>
              </div>

              <div className="text-center px-1 mb-2.5">
                <h4 className="text-white text-sm font-bold tracking-wide">Plano Obrigatório</h4>
                <p className="text-[11px] text-vice-textMuted">Assine a partir de R$ 25/mês</p>
              </div>

              <Link
                href="/planos"
                className="w-full py-2 px-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple hover:from-pink-500 hover:to-purple-600 transition-all duration-200 shadow-[0_0_15px_rgba(255,20,147,0.4)] flex items-center justify-center gap-1.5 group cursor-pointer"
              >
                <span>Ver Planos</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}

          {/* Theme Switcher Toggle */}
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-[#100B1D] border border-[rgba(139,46,255,0.25)] rounded-full p-1 gap-1">
              <Tooltip title="Modo Claro (Em breve)">
                <button
                  onClick={onToggleTheme}
                  className={`p-1.5 rounded-full transition-colors ${
                    !isDarkMode ? 'bg-amber-400/20 text-amber-300' : 'text-vice-textMuted hover:text-white'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip title="Modo Escuro (Padrão Neon)">
                <button
                  onClick={onToggleTheme}
                  className={`p-1.5 rounded-full transition-colors ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-vice-pink/30 to-vice-purple/30 text-white shadow-[0_0_10px_rgba(255,20,147,0.3)]'
                      : 'text-vice-textMuted hover:text-white'
                  }`}
                >
                  <Moon className="w-4 h-4 text-vice-blue" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
