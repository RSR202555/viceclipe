'use client';

import React, { createContext, useContext, useState } from 'react';
import { VideoClip } from '@/types';
import { VideoPlayerModal } from '@/components/modals/VideoPlayerModal';
import { RegisterModal } from '@/components/modals/RegisterModal';
import { NotificationsDrawer } from '@/components/modals/NotificationsDrawer';
import { UploadClipModal } from '@/components/modals/UploadClipModal';
import { Modal } from 'antd';
import { MobileReelFeed } from '@/components/home/MobileReelFeed';

interface AppContextType {
  selectedVideo: VideoClip | null;
  openVideoModal: (video: VideoClip) => void;
  closeVideoModal: () => void;
  isUploadOpen: boolean;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  isRegisterOpen: boolean;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  isNotificationsOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
  isReelModalOpen: boolean;
  openReelModal: () => void;
  closeReelModal: () => void;
  searchGlobalQuery: string;
  setSearchGlobalQuery: (q: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoClip | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [searchGlobalQuery, setSearchGlobalQuery] = useState('');

  const openVideoModal = (video: VideoClip) => setSelectedVideo(video);
  const closeVideoModal = () => setSelectedVideo(null);

  const openUploadModal = () => setIsUploadOpen(true);
  const closeUploadModal = () => setIsUploadOpen(false);

  const openRegisterModal = () => setIsRegisterOpen(true);
  const closeRegisterModal = () => setIsRegisterOpen(false);

  const openNotifications = () => setIsNotificationsOpen(true);
  const closeNotifications = () => setIsNotificationsOpen(false);

  const openReelModal = () => setIsReelModalOpen(true);
  const closeReelModal = () => setIsReelModalOpen(false);

  return (
    <AppContext.Provider
      value={{
        selectedVideo,
        openVideoModal,
        closeVideoModal,
        isUploadOpen,
        openUploadModal,
        closeUploadModal,
        isRegisterOpen,
        openRegisterModal,
        closeRegisterModal,
        isNotificationsOpen,
        openNotifications,
        closeNotifications,
        isReelModalOpen,
        openReelModal,
        closeReelModal,
        searchGlobalQuery,
        setSearchGlobalQuery,
      }}
    >
      {children}

      {/* Global Modals for App experience */}
      <VideoPlayerModal
        video={selectedVideo}
        open={!!selectedVideo}
        onClose={closeVideoModal}
      />

      <RegisterModal
        open={isRegisterOpen}
        onClose={closeRegisterModal}
      />

      <NotificationsDrawer
        open={isNotificationsOpen}
        onClose={closeNotifications}
      />

      <UploadClipModal
        open={isUploadOpen}
        onClose={closeUploadModal}
      />

      {/* Mobile Reel Feed Modal */}
      <Modal
        open={isReelModalOpen}
        onCancel={closeReelModal}
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
        <MobileReelFeed onClose={closeReelModal} isFloating={true} />
      </Modal>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
