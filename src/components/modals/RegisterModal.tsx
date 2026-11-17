'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { Mail, Lock, User, Sparkles, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { ViceLogo } from '../ui/ViceLogo';

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      message.success(
        activeTab === 'register'
          ? 'Conta criada com sucesso! Bem-vindo ao VICE CLIPPER!'
          : 'Login efetuado com sucesso!'
      );
      onClose();
    }, 800);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={460}
      centered
      closeIcon={<X className="w-5 h-5 text-zinc-400 hover:text-white" />}
      styles={{
        content: {
          padding: 28,
          borderRadius: 24,
          backgroundColor: '#151027',
          border: '1px solid rgba(139, 46, 255, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(255, 20, 147, 0.3)',
        },
      }}
    >
      <div className="flex flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-4">
          <ViceLogo size="lg" />
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-[#0C071C] p-1 rounded-full border border-[rgba(139,46,255,0.2)] mb-5 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_0_12px_rgba(255,20,147,0.5)]'
                : 'text-vice-textMuted hover:text-white'
            }`}
          >
            Criar Conta
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_0_12px_rgba(255,20,147,0.5)]'
                : 'text-vice-textMuted hover:text-white'
            }`}
          >
            Entrar
          </button>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-xl font-black text-white font-display mb-1">
          {activeTab === 'register' ? 'Junte-se à Comunidade GTA 6' : 'Bem-vindo de Volta!'}
        </h3>
        <p className="text-xs text-vice-textMuted mb-5">
          {activeTab === 'register'
            ? 'Crie clipes com IA, siga criadores e compartilhe seus momentos em Leonida.'
            : 'Acesse seus clipes favoritos, ferramentas e métricas do studio.'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          {activeTab === 'register' && (
            <div>
              <Input
                size="large"
                prefix={<User className="w-4 h-4 text-vice-textMuted mr-2" />}
                placeholder="Seu nome de usuário ou gamertag"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <Input
              size="large"
              type="email"
              prefix={<Mail className="w-4 h-4 text-vice-textMuted mr-2" />}
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Input.Password
              size="large"
              prefix={<Lock className="w-4 h-4 text-vice-textMuted mr-2" />}
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Benefits bullets */}
          {activeTab === 'register' && (
            <div className="flex flex-col gap-1 text-left bg-[#100B1D]/80 p-3 rounded-xl border border-purple-500/15 my-1 text-[11px] text-zinc-300">
              <div className="flex items-center gap-1.5 text-vice-blue font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Benefícios exclusivos de membro:</span>
              </div>
              <p>• Acesso gratuito ao Vice AI Clipper com exportação em 4K</p>
              <p>• Badge de fundador verificado no chat e comentários</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple hover:opacity-95 shadow-[0_0_20px_rgba(255,20,147,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{activeTab === 'register' ? 'Criar Minha Conta Grátis' : 'Entrar na Plataforma'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </Modal>
  );
};
