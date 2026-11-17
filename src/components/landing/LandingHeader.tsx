'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Drawer } from 'antd';
import { Menu, X, ArrowRight, Sparkles, Smartphone, Layers } from 'lucide-react';
import { ViceLogo } from '../ui/ViceLogo';

export const LandingHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Início', href: '#hero' },
    { label: 'Funcionalidades', href: '#features' },
    { label: 'Como Funciona', href: '#how-it-works' },
    { label: 'Trend Radar', href: '#trend-radar' },
    { label: 'Planos', href: '#pricing' },
    { label: 'Comunidade', href: '#community' },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070611]/90 backdrop-blur-md border-b border-[rgba(139,46,255,0.2)] py-3 shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
          : 'bg-gradient-to-b from-[#070611]/95 via-[#070611]/60 to-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center">
          <ViceLogo size="sm" showSubtitle={false} />
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 bg-[#120B24]/70 border border-purple-500/20 px-4 py-1.5 rounded-full backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="px-3 py-1 rounded-full text-xs font-semibold text-vice-textMuted hover:text-white hover:bg-white/5 transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/app"
            className="text-xs font-bold text-vice-blue hover:text-white px-3 py-2 rounded-full transition-colors flex items-center gap-1.5"
          >
            <span>Acessar Plataforma</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/login"
            className="text-xs font-semibold text-vice-textMuted hover:text-white px-3.5 py-2 rounded-full hover:bg-white/5 transition-all"
          >
            Entrar
          </Link>

          <Link
            href="/cadastro"
            className="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple hover:opacity-95 shadow-[0_0_15px_rgba(255,20,147,0.45)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            Criar Conta
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 rounded-xl text-vice-textMuted hover:text-white hover:bg-white/5"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        placement="right"
        width={300}
        closeIcon={<X className="w-5 h-5 text-zinc-400 hover:text-white" />}
        styles={{
          header: {
            backgroundColor: '#0C071C',
            borderBottom: '1px solid rgba(139, 46, 255, 0.2)',
          },
          body: {
            backgroundColor: '#070611',
            padding: 20,
          },
        }}
        title={<ViceLogo size="sm" showSubtitle={false} />}
      >
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-vice-textMuted hover:text-white hover:bg-purple-900/20 transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-purple-500/20">
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-full text-xs font-bold text-center text-vice-blue bg-[#151027] border border-cyan-500/30 shadow-[0_0_12px_rgba(0,217,255,0.2)]"
            >
              Acessar Plataforma
            </Link>

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-full text-xs font-semibold text-center text-white bg-white/5 border border-white/10"
            >
              Entrar
            </Link>

            <Link
              href="/cadastro"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-full text-xs font-bold text-center text-white bg-gradient-to-r from-vice-pink to-vice-purple shadow-[0_0_15px_#FF1493]"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </Drawer>
    </header>
  );
};
