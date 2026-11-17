'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input, Dropdown, Badge, MenuProps, Tooltip } from 'antd';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  Bookmark,
  LogOut,
  Smartphone,
  Sparkles,
  Menu as MenuIcon,
  Video,
} from 'lucide-react';
import { CURRENT_USER } from '@/data/mockData';
import { ViceLogo } from '../ui/ViceLogo';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onOpenNotifications?: () => void;
  onOpenReelFeed?: () => void;
  onOpenProfile?: () => void;
  onOpenUpload?: () => void;
  onToggleMobileSidebar?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onOpenNotifications,
  onOpenReelFeed,
  onOpenProfile,
  onOpenUpload,
  onToggleMobileSidebar,
  unreadCount = 2,
}) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const profileMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div className="py-1 border-b border-purple-500/20">
          <p className="text-white font-bold text-sm">{CURRENT_USER.name}</p>
          <p className="text-xs text-vice-blue">{CURRENT_USER.handle}</p>
        </div>
      ),
    },
    {
      key: 'profile',
      icon: <User className="w-4 h-4 text-vice-pink" />,
      label: 'Meu Perfil',
      onClick: () => {
        if (onOpenProfile) onOpenProfile();
        router.push('/app/perfil');
      },
    },
    {
      key: 'studio',
      icon: <Video className="w-4 h-4 text-purple-400" />,
      label: 'Creator Studio',
      onClick: () => router.push('/app/criadores'),
    },
    {
      key: 'saved',
      icon: <Bookmark className="w-4 h-4 text-amber-400" />,
      label: 'Clipes Salvos',
      onClick: () => router.push('/app/perfil'),
    },
    {
      key: 'settings',
      icon: <Settings className="w-4 h-4 text-zinc-400" />,
      label: 'Configurações',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      danger: true,
      icon: <LogOut className="w-4 h-4" />,
      label: 'Sair para Início',
      onClick: () => router.push('/'),
    },
  ];

  return (
    <header className="sticky top-0 z-20 w-full bg-[#070611]/90 backdrop-blur-md border-b border-[rgba(139,46,255,0.15)] px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle, Mobile Logo & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-vice-textMuted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        )}

        <div className="lg:hidden flex items-center mr-1">
          <Link href="/">
            <ViceLogo size="sm" showSubtitle={false} />
          </Link>
        </div>

        {/* Search Bar matching reference */}
        <div className="relative w-full max-w-xl">
          <Input
            value={searchValue}
            onChange={handleSearchChange}
            prefix={<Search className="w-4 h-4 text-vice-textMuted mr-2" />}
            suffix={
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-zinc-400 bg-white/5 rounded border border-white/10 font-mono">
                ⌘K
              </kbd>
            }
            placeholder="Buscar por momentos, criadores ou assuntos..."
            className="w-full text-sm placeholder:text-zinc-500 rounded-full bg-[#100B1D] border-[rgba(139,46,255,0.22)] focus:border-vice-pink"
            allowClear
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, Feed Shorts button, Profile */}
      <div className="flex items-center gap-3">
        {/* Button to test vertical mobile shorts feed */}
        <Tooltip title="Abrir feed de clipes verticais (Estilo Reels/TikTok)">
          <button
            onClick={onOpenReelFeed}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#160F2B] border border-cyan-500/30 text-vice-blue hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(0,217,255,0.35)] transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-vice-blue" />
            <span>Feed Clipes</span>
          </button>
        </Tooltip>

        {/* Upload Action */}
        <button
          onClick={onOpenUpload}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple hover:opacity-95 shadow-[0_0_15px_rgba(255,20,147,0.35)] transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Clipar IA</span>
        </button>

        {/* Notifications Icon with Badge */}
        <Tooltip title="Notificações">
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full text-vice-textMuted hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Badge count={unreadCount} size="small" offset={[2, -2]}>
              <Bell className="w-5 h-5 text-vice-textMuted hover:text-white" />
            </Badge>
          </button>
        </Tooltip>

        {/* User Profile Pill & Dropdown */}
        <Dropdown menu={{ items: profileMenuItems }} trigger={['click']} placement="bottomRight">
          <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[#151027] border border-[rgba(139,46,255,0.22)] hover:border-vice-pink/50 cursor-pointer transition-all duration-200">
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-purple-400/40">
              <Image
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.name}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-xs font-bold text-white tracking-wide hidden sm:inline">
              {CURRENT_USER.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-vice-textMuted" />
          </div>
        </Dropdown>
      </div>
    </header>
  );
};
