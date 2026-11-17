'use client';

import React from 'react';
import { Drawer, Badge } from 'antd';
import { Bell, Flame, Radio, Scissors, Check, X } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '@/data/mockData';

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  open,
  onClose,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'live':
        return <Radio className="w-4 h-4 text-vice-pink" />;
      case 'clipper':
        return <Scissors className="w-4 h-4 text-vice-blue" />;
      default:
        return <Bell className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2 text-white">
          <Bell className="w-5 h-5 text-vice-pink" />
          <span className="font-display font-bold">Notificações</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      closeIcon={<X className="w-5 h-5 text-zinc-400 hover:text-white" />}
      width={360}
      styles={{
        header: {
          backgroundColor: '#0E081F',
          borderBottom: '1px solid rgba(139, 46, 255, 0.2)',
        },
        body: {
          backgroundColor: '#0A0618',
          padding: 16,
        },
      }}
    >
      <div className="flex flex-col gap-3">
        {MOCK_NOTIFICATIONS.map((notif) => (
          <div
            key={notif.id}
            className={`p-3 rounded-xl border transition-all ${
              notif.unread
                ? 'bg-[#181030] border-pink-500/30 shadow-[0_0_15px_rgba(255,20,147,0.15)]'
                : 'bg-[#120B24] border-purple-500/15'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white">{notif.title}</h5>
                  {notif.unread && (
                    <span className="w-2 h-2 rounded-full bg-vice-pink animate-pulse" />
                  )}
                </div>
                <p className="text-[11px] text-vice-textMuted mt-1 leading-snug">
                  {notif.description}
                </p>
                <span className="text-[10px] text-zinc-500 font-mono mt-1.5 inline-block">
                  {notif.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
};
