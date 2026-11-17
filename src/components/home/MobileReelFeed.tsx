'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  CheckCircle2,
  Home,
  Compass,
  Plus,
  Users,
  User,
  Search,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ViceLogo } from '../ui/ViceLogo';

interface MobileReelFeedProps {
  onClose?: () => void;
  isFloating?: boolean;
}

export const MobileReelFeed: React.FC<MobileReelFeedProps> = ({
  onClose,
  isFloating = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(125);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState<'para-voce' | 'em-alta' | 'seguindo'>('para-voce');

  const handleLike = () => {
    if (isLiked) {
      setLikesCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  return (
    <div
      className={`relative w-[340px] h-[680px] rounded-[42px] bg-[#0A0516] border-[5px] border-[#201538] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(139,46,255,0.25)] flex flex-col overflow-hidden select-none flex-shrink-0 ${
        isFloating ? 'mx-auto' : ''
      }`}
    >
      {/* Top Phone Notch / Dynamic Island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-black/90 z-30 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 mr-2 border border-white/10" />
        <div className="w-2 h-2 rounded-full bg-zinc-800" />
      </div>

      {/* Status Bar */}
      <div className="absolute top-2 inset-x-6 flex items-center justify-between text-[11px] font-semibold text-white z-20 pointer-events-none">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">5G</span>
          <div className="w-4 h-2 rounded-sm border border-white/60 p-0.5">
            <div className="w-full h-full bg-white rounded-xs" />
          </div>
        </div>
      </div>

      {/* Video Content Background */}
      <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
        {/* Background Video Frame Artwork */}
        <Image
          src="/images/mobile-reel-preview.png"
          alt="Feed Vertical GTA 6"
          fill
          className="object-cover object-center"
          priority
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Video Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/60 pointer-events-none" />

        {/* Top Header of Mobile Screen */}
        <div className="relative z-20 pt-7 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/images/vice-clipper-logo-transparent.png"
              alt="VICE CLIPPER"
              width={105}
              height={38}
              className="object-contain drop-shadow-[0_0_8px_rgba(139,46,255,0.5)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-full bg-black/40 text-white hover:text-vice-pink">
              <Search className="w-4 h-4" />
            </button>
            <div className="w-6 h-6 rounded-full overflow-hidden border border-purple-400">
              <Image
                src="/images/gamerbr-avatar.png"
                alt="Avatar"
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Feed Tabs: Para Você / Em Alta / Seguindo */}
        <div className="relative z-20 flex items-center justify-center gap-2 px-4 mt-2">
          <button
            onClick={() => setActiveTab('para-voce')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === 'para-voce'
                ? 'bg-vice-pink text-white shadow-[0_0_12px_rgba(255,20,147,0.6)]'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            Para você
          </button>
          <button
            onClick={() => setActiveTab('em-alta')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === 'em-alta'
                ? 'bg-vice-pink text-white shadow-[0_0_12px_rgba(255,20,147,0.6)]'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            Em alta
          </button>
          <button
            onClick={() => setActiveTab('seguindo')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === 'seguindo'
                ? 'bg-vice-pink text-white shadow-[0_0_12px_rgba(255,20,147,0.6)]'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            Seguindo
          </button>
        </div>

        {/* Center: Mute Button */}
        <div className="absolute right-4 top-28 z-20">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-md"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-vice-blue" />}
          </button>
        </div>

        {/* Right Action Icons Column */}
        <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-3">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                isLiked
                  ? 'bg-vice-pink border-vice-pink text-white shadow-[0_0_15px_#FF1493]'
                  : 'bg-black/50 border-white/20 text-white hover:text-vice-pink'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
              {likesCount}K
            </span>
          </button>

          {/* Comments */}
          <button className="flex flex-col items-center group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center backdrop-blur-md hover:text-vice-blue transition-colors">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-white mt-1 drop-shadow">4.8K</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                isBookmarked
                  ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_12px_#F59E0B]'
                  : 'bg-black/50 border-white/20 text-white hover:text-amber-400'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[11px] font-bold text-white mt-1 drop-shadow">12K</span>
          </button>

          {/* Share */}
          <button className="flex flex-col items-center group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center backdrop-blur-md hover:text-vice-pink transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-white mt-1 drop-shadow">8.1K</span>
          </button>
        </div>

        {/* Bottom Creator Info & Caption */}
        <div className="relative z-20 px-4 pb-16 flex flex-col gap-2 max-w-[80%]">
          {/* Creator Tag & Follow */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-purple-400">
              <Image
                src="/images/gamerbr-avatar.png"
                alt="GamerBR"
                width={28}
                height={28}
                className="object-cover"
              />
            </div>
            <span className="text-xs font-bold text-white flex items-center gap-1 drop-shadow">
              GamerBR <CheckCircle2 className="w-3 h-3 text-vice-blue" />
            </span>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                isFollowing
                  ? 'bg-white/20 text-white'
                  : 'bg-vice-pink text-white shadow-[0_0_10px_rgba(255,20,147,0.5)]'
              }`}
            >
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </button>
          </div>

          {/* Title & Hashtags */}
          <p className="text-xs text-white leading-snug drop-shadow-md">
            Vice City nunca foi tão linda! 😍{' '}
            <span className="text-vice-blue font-semibold">#GTA6 #ViceCity #Gameplay</span>
          </p>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-black/90 backdrop-blur-md border-t border-white/10 px-4 flex items-center justify-around z-30">
          <button className="flex flex-col items-center text-vice-pink text-[10px] font-bold">
            <Home className="w-4 h-4" />
            <span>Início</span>
          </button>
          <button className="flex flex-col items-center text-zinc-400 hover:text-white text-[10px]">
            <Compass className="w-4 h-4" />
            <span>Explorar</span>
          </button>
          {/* Plus Add Button */}
          <button className="w-8 h-8 rounded-full bg-gradient-to-r from-vice-pink to-vice-purple text-white flex items-center justify-center shadow-[0_0_12px_rgba(255,20,147,0.6)]">
            <Plus className="w-5 h-5 font-bold" />
          </button>
          <button className="flex flex-col items-center text-zinc-400 hover:text-white text-[10px]">
            <Users className="w-4 h-4" />
            <span>Criadores</span>
          </button>
          <button className="flex flex-col items-center text-zinc-400 hover:text-white text-[10px]">
            <User className="w-4 h-4" />
            <span>Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
