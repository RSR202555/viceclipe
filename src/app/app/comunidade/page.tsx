'use client';

import React from 'react';
import { MessageSquare, Users, Sparkles, Heart, MessageCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ComunidadePage() {
  const { openRegisterModal } = useApp();

  const discussions = [
    {
      id: 'disc-1',
      author: 'ViceRider99',
      avatar: '/avatars/avatar-1.png',
      title: 'A física dos carros na chuva está realmente parecida com GTA 4 ou é mais arcade?',
      replies: 42,
      likes: 128,
      tag: 'Debate',
      time: 'Há 3 horas',
    },
    {
      id: 'disc-2',
      author: 'LeonidaHunter',
      avatar: '/avatars/avatar-2.png',
      title: 'Possível mapa completo vazado: Ilhas além de Vice City confirmadas?',
      replies: 86,
      likes: 312,
      tag: 'Teorias',
      time: 'Há 5 horas',
    },
    {
      id: 'disc-3',
      author: 'GamerBR',
      avatar: '/images/gamerbr-avatar.png',
      title: 'Top 5 melhores spots para drift gravados até agora no hub',
      replies: 29,
      likes: 95,
      tag: 'Gameplay',
      time: 'Há 1 dia',
    },
  ];

  return (
    <div className="flex flex-col gap-6 select-none">
      <div className="pb-4 border-b border-purple-500/15">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Fórum & Debates</span>
        </div>
        <h1 className="text-3xl font-black italic uppercase font-display text-white">
          Comunidade VICE CLIPPER
        </h1>
        <p className="text-sm text-vice-textMuted max-w-2xl">
          Participe de discussões ao vivo, teorias da trama de GTA 6 e vote nas melhores clipagens da semana.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discussions List */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Tópicos Mais Votados
          </h3>

          {discussions.map((d) => (
            <div
              key={d.id}
              className="p-5 rounded-2xl bg-[#151027] border border-purple-500/20 hover:border-vice-pink/40 transition-all flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{d.author}</span>
                  <span className="text-zinc-600 text-xs">•</span>
                  <span className="text-[11px] text-zinc-500">{d.time}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-vice-blue border border-white/10">
                  {d.tag}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white hover:text-vice-pink transition-colors cursor-pointer">
                {d.title}
              </h4>

              <div className="flex items-center gap-4 text-xs text-vice-textMuted pt-2 border-t border-purple-500/15">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-vice-pink" />
                  {d.likes} curtidas
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-vice-blue" />
                  {d.replies} respostas
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Community Rules & CTA */}
        <div className="flex flex-col gap-4">
          <div className="p-6 rounded-2xl bg-[#151027] border border-purple-500/20 text-center flex flex-col items-center">
            <Users className="w-10 h-10 text-vice-pink mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              Participe da Conversa
            </h3>
            <p className="text-xs text-vice-textMuted mb-4">
              Crie sua conta para publicar clips, comentar nos tópicos e votar nos rankings.
            </p>
            <button
              onClick={openRegisterModal}
              className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple shadow-[0_0_15px_#FF1493] cursor-pointer"
            >
              Criar Conta Gratuita
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#100B1D] border border-purple-500/15 text-xs text-vice-textMuted leading-relaxed">
            <h4 className="font-bold text-white mb-2 uppercase text-[11px]">
              Regras da Comunidade
            </h4>
            <p>1. Respeite todos os criadores e membros.</p>
            <p>2. Não publique spoilers de vazamentos sem aviso de tag.</p>
            <p>3. Utilize títulos descritivos e precisos nos clipes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
