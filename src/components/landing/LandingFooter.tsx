'use client';

import React from 'react';
import Link from 'next/link';
import { ViceLogo } from '../ui/ViceLogo';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#05030D] border-t border-[rgba(139,46,255,0.18)] pt-16 pb-12 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Col 1: Logo & Brand Description (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="inline-block">
              <ViceLogo size="sm" showSubtitle={true} />
            </Link>

            <p className="text-xs sm:text-sm text-vice-textMuted leading-relaxed max-w-sm mt-1">
              A plataforma definitiva voltada à comunidade de GTA 6. Descubra tendências, encontre os melhores momentos em vídeos e produza clipes de alto impacto.
            </p>

            <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono mt-2">
              <span>Vice City & Leonida</span>
              <span>•</span>
              <span className="text-vice-pink">The Hub 2026</span>
            </div>
          </div>

          {/* Col 2: Plataforma */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Plataforma
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-vice-textMuted">
              <li>
                <Link href="/app/explorar" className="hover:text-white transition-colors">
                  Explorar
                </Link>
              </li>
              <li>
                <Link href="/app/trend-radar" className="hover:text-white transition-colors">
                  Trend Radar
                </Link>
              </li>
              <li>
                <Link href="/app/clipper" className="hover:text-white transition-colors">
                  AI Clipper
                </Link>
              </li>
              <li>
                <Link href="/app/criadores" className="hover:text-white transition-colors">
                  Criadores
                </Link>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Planos & Preços
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Comunidade */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Comunidade
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-vice-textMuted">
              <li>
                <Link href="/app/comunidade" className="hover:text-white transition-colors">
                  Comunidade
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-white transition-colors">
                  Feed de Clipes
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className="hover:text-white transition-colors">
                  Criar Conta
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Entrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Institucional */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Institucional
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-vice-textMuted">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Sobre o Projeto
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Contato & Suporte
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Política de Privacidade
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Termos de Uso
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Independence Disclaimer & Copyright */}
        <div className="pt-8 border-t border-[rgba(139,46,255,0.15)] flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-[11px] text-zinc-500 leading-relaxed max-w-3xl">
            <strong>Aviso de Independência:</strong> VICE CLIPPER é uma plataforma independente, sem vínculo oficial, patrocínio ou associação com Rockstar Games ou Take-Two Interactive. GTA e suas marcas pertencem aos respectivos proprietários.
          </p>

          <span className="text-[11px] text-zinc-500 font-mono flex-shrink-0">
            © 2026 VICE CLIPPER. Todos os direitos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
};
