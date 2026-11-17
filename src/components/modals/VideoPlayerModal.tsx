'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Modal, Tooltip, Input, Button } from 'antd';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  Bookmark,
  CheckCircle2,
  Eye,
  MessageSquare,
  Sparkles,
  Send,
  X,
} from 'lucide-react';
import { VideoClip } from '@/types';

interface VideoPlayerModalProps {
  video: VideoClip | null;
  open: boolean;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  open,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<string[]>([
    'Essa física da água tá surreal demais! 🔥',
    'Mal posso esperar pelo lançamento em 2026!',
    'O nível de reflexo nos carros parece filme de cinema.',
  ]);

  if (!video) return null;

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    setCommentsList([commentText, ...commentsList]);
    setCommentText('');
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      closeIcon={<X className="w-5 h-5 text-zinc-400 hover:text-white" />}
      styles={{
        content: {
          padding: 0,
          borderRadius: 24,
          backgroundColor: '#151027',
          border: '1px solid rgba(139, 46, 255, 0.3)',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(255, 20, 147, 0.25)',
        },
      }}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Left: Video Player Box */}
        <div className="relative w-full lg:w-3/5 bg-black flex items-center justify-center min-h-[320px] lg:min-h-[460px] overflow-hidden">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

          {/* Fake Player Center Play Icon */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-vice-pink to-vice-purple text-white flex items-center justify-center shadow-[0_0_25px_rgba(255,20,147,0.8)] z-10 hover:scale-110 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          {/* Bottom Video Controls Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent flex items-center justify-between z-10">
            <span className="text-xs font-mono text-zinc-300">
              00:18 / {video.duration}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] bg-red-600 px-1.5 py-0.5 rounded text-white font-bold tracking-wider uppercase">
                4K HDR
              </span>
            </div>
          </div>
        </div>

        {/* Right: Video Metadata & Social Interaction */}
        <div className="w-full lg:w-2/5 p-5 flex flex-col justify-between bg-[#151027] border-t lg:border-t-0 lg:border-l border-[rgba(139,46,255,0.2)]">
          <div>
            {/* Creator Row */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/15 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-purple-400">
                  <Image
                    src={video.creator.avatar}
                    alt={video.creator.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1">
                    {video.creator.name}
                    {video.creator.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-vice-blue" />
                    )}
                  </h4>
                  <p className="text-[11px] text-vice-textMuted">{video.creator.handle}</p>
                </div>
              </div>

              <button className="px-3 py-1 rounded-full text-xs font-bold bg-vice-pink/20 hover:bg-vice-pink text-vice-pink hover:text-white border border-vice-pink/40 transition-all">
                Seguir
              </button>
            </div>

            {/* Title & Description */}
            <h3 className="text-base font-bold text-white leading-snug mb-2 font-display">
              {video.title}
            </h3>
            <p className="text-xs text-vice-textMuted leading-relaxed mb-3">
              {video.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {video.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] text-vice-blue bg-vice-blue/10 px-2 py-0.5 rounded-full border border-vice-blue/20"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Social Counts Bar */}
            <div className="flex items-center justify-around py-2.5 rounded-xl bg-[#100B1D] border border-purple-500/20 mb-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                  isLiked ? 'text-vice-pink' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{video.likes}</span>
              </button>

              <div className="flex items-center gap-1 text-xs font-bold text-zinc-400">
                <Eye className="w-4 h-4 text-vice-blue" />
                <span>{video.views}</span>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-zinc-400">
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>{video.shares}</span>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1 mb-3">
              <span className="text-[11px] uppercase font-bold text-zinc-400">
                Comentários ({commentsList.length})
              </span>
              {commentsList.map((c, i) => (
                <div key={i} className="p-2 rounded-lg bg-[#100B1D]/60 text-xs text-zinc-300">
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Comment Input */}
          <div className="flex items-center gap-2 pt-2 border-t border-purple-500/15">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onPressEnter={handleSendComment}
              placeholder="Deixe seu comentário sobre GTA 6..."
              className="text-xs"
            />
            <button
              onClick={handleSendComment}
              className="p-2 rounded-full bg-vice-pink text-white hover:opacity-90 flex-shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
