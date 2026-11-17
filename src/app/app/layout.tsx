'use client';

import React, { useState } from 'react';
import { Drawer } from 'antd';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AppProvider, useApp } from '@/context/AppContext';
import { MobileReelFeed } from '@/components/home/MobileReelFeed';
import { Smartphone } from 'lucide-react';

function InternalAppShell({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const {
    openNotifications,
    openReelModal,
    openUploadModal,
    openRegisterModal,
    setSearchGlobalQuery,
  } = useApp();

  return (
    <div className="flex min-h-screen bg-[#070611] text-white">
      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onOpenRegister={openRegisterModal} />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Drawer
        placement="left"
        open={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        width={280}
        styles={{
          body: { padding: 0, backgroundColor: '#0A0618' },
        }}
      >
        <Sidebar
          onOpenRegister={() => {
            setIsMobileSidebarOpen(false);
            openRegisterModal();
          }}
          onSelectTab={() => setIsMobileSidebarOpen(false)}
        />
      </Drawer>

      {/* Center Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onSearch={setSearchGlobalQuery}
          onOpenNotifications={openNotifications}
          onOpenReelFeed={openReelModal}
          onOpenUpload={openUploadModal}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-8 max-w-[1700px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Ultra-wide Right Panel: Live Mobile Reel Frame from the Reference Image */}
      <aside className="hidden 2xl:block p-6 sticky top-0 h-screen overflow-y-auto border-l border-[rgba(139,46,255,0.18)] bg-[#070611]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-vice-textMuted uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-vice-pink" />
            <span>Feed Vertical ao Vivo</span>
          </div>
          <MobileReelFeed isFloating={false} />
        </div>
      </aside>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <InternalAppShell>{children}</InternalAppShell>
    </AppProvider>
  );
}
