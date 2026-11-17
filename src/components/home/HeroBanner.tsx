'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from 'antd';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Play } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onPlayFeaturedClip?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onPlayFeaturedClip,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      tag: 'DESTAQUE DA SEMANA',
      titleLine1: 'O MAIOR LANÇAMENTO',
      titleLine2: 'DA DÉCADA!',
      description: 'Descubra os melhores momentos de GTA 6 na nossa comunidade.',
      cta: 'Explorar Agora',
    },
    {
      tag: 'NOVIDADES LEONIDA',
      titleLine1: 'EXPLORE VICE CITY',
      titleLine2: 'COMO NUNCA ANTES',
      description: 'Assista a gameplays em 4K, segredos escondidos e clipes da comunidade em primeira mão.',
      cta: 'Ver Destaques',
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[rgba(139,46,255,0.35)] bg-gradient-to-r from-[#0C061A] via-[#150A2E] to-[#1E0B3B] shadow-[0_12px_45px_rgba(139,46,255,0.18)] select-none">
      {/* Background Decorative Ambient Neon Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-pink-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-72 h-72 rounded-full bg-cyan-500/15 blur-[90px] pointer-events-none" />

      {/* Right-side Artwork: Vice City Skyline, Helicopter & Characters */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-2/3 lg:w-1/2 pointer-events-none overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src="/images/hero-art.png"
            alt="Vice City Sunset Skyline e Personagens"
            fill
            priority
            className="object-cover object-right-top opacity-90 transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          {/* Gradient Masks for Seamless Edge Blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C061A] via-[#0C061A]/70 sm:via-[#0C061A]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C061A] via-transparent to-transparent sm:hidden" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-center min-h-[300px] lg:min-h-[340px] max-w-2xl">
        {/* Badge Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-vice-pink text-xs font-bold tracking-wider uppercase mb-3 w-fit shadow-[0_0_15px_rgba(255,20,147,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-vice-blue" />
          <span>{slide.tag}</span>
        </div>

        {/* Dynamic Title */}
        <div className="flex flex-col mb-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tight text-white uppercase drop-shadow-md font-display leading-tight">
            {slide.titleLine1}
          </h1>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black italic tracking-tight text-vice-pink font-display uppercase leading-none drop-shadow-[0_0_25px_rgba(255,20,147,0.65)]">
            {slide.titleLine2}
          </h2>
        </div>

        {/* Description */}
        <p className="text-vice-textMuted text-sm sm:text-base font-normal max-w-lg mb-6 leading-relaxed">
          {slide.description}
        </p>

        {/* CTA Button and Play Preview */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={onExploreClick}
            className="px-7 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-vice-pink via-[#E6007A] to-vice-purple hover:opacity-95 shadow-[0_0_22px_rgba(255,20,147,0.5)] transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer group"
          >
            <span>{slide.cta}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {onPlayFeaturedClip && (
            <button
              onClick={onPlayFeaturedClip}
              className="px-5 py-3 rounded-full text-sm font-semibold text-zinc-200 bg-black/40 hover:bg-white/10 border border-white/15 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-vice-blue/20 flex items-center justify-center text-vice-blue border border-vice-blue/40">
                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
              </div>
              <span>Assistir Trailer</span>
            </button>
          )}
        </div>
      </div>

      {/* Carousel Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Slide anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 z-10 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Próximo slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 z-10 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentSlide === idx ? 'w-6 bg-vice-pink shadow-[0_0_8px_#FF1493]' : 'w-2 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
