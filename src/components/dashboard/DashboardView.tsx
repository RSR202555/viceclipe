'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Drawer, Modal, message } from 'antd';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { HeroBanner } from '@/components/home/HeroBanner';
import { StatsSection } from '@/components/home/StatsSection';
import { TrendingVideos } from '@/components/home/TrendingVideos';
import { TrendRadarSection } from '@/components/home/TrendRadarSection';
import { ViceAiClipperSection } from '@/components/home/ViceAiClipperSection';
import { CreatorStudioSection } from '@/components/home/CreatorStudioSection';
import { MobileReelFeed } from '@/components/home/MobileReelFeed';
import { VideoPlayerModal } from '@/components/modals/VideoPlayerModal';
import { RegisterModal } from '@/components/modals/RegisterModal';
import { NotificationsDrawer } from '@/components/modals/NotificationsDrawer';
import { UploadClipModal } from '@/components/modals/UploadClipModal';
import { VideoClip } from '@/types';
import { TRENDING_VIDEOS, STATS_DATA } from '@/data/mockData';
import { Smartphone, Sparkles, Filter, Users, Flame, Layers, ArrowLeft } from 'lucide-react';

interface DashboardViewProps {
  initialTab?: NavTab;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  initialTab = 'inicio',
}) => {
  const [activeTab, setActiveTab] = useState<NavTab>(initialTab);
  const [selectedVideo, setSelectedVideo] = useState<VideoClip | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Video filtering
  const filteredVideos = TRENDING_VIDEOS.filter((vid) => {
    const matchesSearch =
      vid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'Todos' || vid.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['Todos', 'Gameplay', 'Highlights', 'Easter Eggs', 'Trailer'];

  const handleStatClick = (statId: string) => {
    if (statId === 'stat-1') {
      setActiveTab('em-alta');
    } else if (statId === 'stat-4') {
      setActiveTab('criadores');
    } else {
      message.info('Filtrando estatísticas em tempo real...');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070611] text-white">
      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenRegister={() => setIsRegisterOpen(true)}
        />
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
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          onOpenRegister={() => {
            setIsMobileSidebarOpen(false);
            setIsRegisterOpen(true);
          }}
        />
      </Drawer>

      {/* Center Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onSearch={setSearchQuery}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenReelFeed={() => setIsReelModalOpen(true)}
          onOpenProfile={() => setActiveTab('perfil')}
          onOpenUpload={() => setIsUploadOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-8 max-w-[1700px] w-full mx-auto">
          {/* Back to landing page banner / quick switch */}
          <div className="flex items-center justify-between text-xs px-4 py-2 rounded-xl bg-[#100B1D] border border-purple-500/20 text-vice-textMuted">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Você está no ambiente interativo da plataforma VICE CLIPPER</span>
            </div>
            <Link
              href="/"
              className="text-vice-blue hover:text-white flex items-center gap-1 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Landing Page</span>
            </Link>
          </div>

          {/* Main Dashboard View: Início */}
          {activeTab === 'inicio' && (
            <>
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_0_12px_rgba(255,20,147,0.4)]'
                        : 'bg-[#151027] text-vice-textMuted border border-purple-500/20 hover:text-white hover:border-vice-pink/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 4.3 Hero Banner */}
              <HeroBanner
                onExploreClick={() => setActiveTab('explorar')}
                onPlayFeaturedClip={() => setSelectedVideo(TRENDING_VIDEOS[0])}
              />

              {/* 4.4 Stats Cards (4 Cards) */}
              <StatsSection onStatClick={handleStatClick} />

              {/* 4.5 Seção Vídeos em Alta */}
              <TrendingVideos
                videos={filteredVideos}
                onSelectVideo={setSelectedVideo}
                onViewAll={() => setActiveTab('em-alta')}
              />

              {/* Bottom Modules from Design Reference */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Module 1: Trend Radar */}
                <div className="xl:col-span-1">
                  <TrendRadarSection
                    onSelectTopic={(topic) => {
                      setSearchQuery(topic);
                      message.info(`Buscando clipes sobre "${topic}"`);
                    }}
                  />
                </div>

                {/* Module 2: Vice AI Clipper */}
                <div className="xl:col-span-1">
                  <ViceAiClipperSection
                    onOpenUploader={() => setIsUploadOpen(true)}
                  />
                </div>

                {/* Module 3: Creator Studio */}
                <div className="xl:col-span-1">
                  <CreatorStudioSection
                    onNewVideoClick={() => setIsUploadOpen(true)}
                    onViewStudio={() => setActiveTab('criadores')}
                    onSelectStudioVideo={() => setSelectedVideo(TRENDING_VIDEOS[3])}
                  />
                </div>
              </div>
            </>
          )}

          {/* Secondary Tabs */}
          {activeTab === 'explorar' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-black italic uppercase text-white font-display">
                  Explorar Leonida
                </h2>
                <p className="text-sm text-vice-textMuted">
                  Descubra os momentos mais virais gravados pelos jogadores no mapa de Leonida e Vice City.
                </p>
              </div>
              <TrendingVideos
                videos={filteredVideos}
                onSelectVideo={setSelectedVideo}
              />
            </div>
          )}

          {activeTab === 'em-alta' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-vice-pink" />
                <h2 className="text-2xl font-black italic uppercase text-white font-display">
                  Momentos Em Alta
                </h2>
              </div>
              <StatsSection onStatClick={handleStatClick} />
              <TrendingVideos
                videos={TRENDING_VIDEOS}
                onSelectVideo={setSelectedVideo}
              />
            </div>
          )}

          {activeTab === 'trend-radar' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-vice-blue" />
                <h2 className="text-2xl font-black italic uppercase text-white font-display">
                  Trend Radar de Leonida
                </h2>
              </div>
              <TrendRadarSection />
              <TrendingVideos
                videos={TRENDING_VIDEOS}
                onSelectVideo={setSelectedVideo}
              />
            </div>
          )}

          {activeTab === 'clipper' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-vice-pink" />
                <h2 className="text-2xl font-black italic uppercase text-white font-display">
                  Vice AI Clipper Hub
                </h2>
              </div>
              <ViceAiClipperSection onOpenUploader={() => setIsUploadOpen(true)} />
            </div>
          )}

          {activeTab === 'criadores' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl font-black italic uppercase text-white font-display">
                  Criadores Verificados
                </h2>
              </div>
              <CreatorStudioSection
                onNewVideoClick={() => setIsUploadOpen(true)}
                onSelectStudioVideo={() => setSelectedVideo(TRENDING_VIDEOS[1])}
              />
              <TrendingVideos
                videos={TRENDING_VIDEOS}
                onSelectVideo={setSelectedVideo}
              />
            </div>
          )}

          {activeTab === 'comunidade' && (
            <div className="p-8 rounded-2xl bg-[#151027] border border-purple-500/20 text-center flex flex-col items-center">
              <Users className="w-12 h-12 text-vice-pink mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Comunidade VICE CLIPPER</h3>
              <p className="text-sm text-vice-textMuted max-w-md mb-4">
                Participe de discussões ao vivo, teorias da trama de GTA 6 e vote nas melhores clipagens semanais.
              </p>
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple shadow-[0_0_15px_#FF1493]"
              >
                Entrar na Comunidade
              </button>
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="flex flex-col gap-6">
              <CreatorStudioSection
                onNewVideoClick={() => setIsUploadOpen(true)}
                onSelectStudioVideo={() => setSelectedVideo(TRENDING_VIDEOS[0])}
              />
            </div>
          )}
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

      {/* Interactive Modals */}
      <VideoPlayerModal
        video={selectedVideo}
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      <RegisterModal
        open={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      <NotificationsDrawer
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <UploadClipModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {/* Mobile Reel Feed Modal for screens under 2xl */}
      <Modal
        open={isReelModalOpen}
        onCancel={() => setIsReelModalOpen(false)}
        footer={null}
        width={380}
        centered
        styles={{
          content: {
            padding: 0,
            background: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <MobileReelFeed onClose={() => setIsReelModalOpen(false)} isFloating={true} />
      </Modal>
    </div>
  );
};
