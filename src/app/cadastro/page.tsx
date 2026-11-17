'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, message } from 'antd';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { ViceLogo } from '@/components/ui/ViceLogo';
import { useAuth } from '@/context/AuthContext';

function CadastroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();

  const redirectParam = searchParams.get('redirect') || '/app';
  const planoParam = searchParams.get('plano') || 'pro';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);

    try {
      const res = await signup(name, email);
      if (res.success && res.session) {
        message.success('Conta criada com sucesso! Redirecionando para a ativação do plano...');

        // If user already had an active subscription
        if (res.session.hasAccess) {
          router.push(redirectParam);
        } else {
          // Direct to checkout for the chosen plan
          router.push(`/checkout?plano=${planoParam}&redirect=${encodeURIComponent(redirectParam)}`);
        }
      } else {
        message.error(res.error || 'Erro ao cadastrar usuário.');
      }
    } catch (err: any) {
      message.error('Erro de conexão ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070611] text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-pink-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-600/10 blur-[130px] pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 flex items-center justify-between max-w-6xl w-full mx-auto relative z-10">
        <Link href="/">
          <ViceLogo size="sm" />
        </Link>
        <Link
          href="/"
          className="text-xs text-vice-textMuted hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Início</span>
        </Link>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-[#151027]/90 backdrop-blur-xl border border-[rgba(139,46,255,0.3)] rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(255,20,147,0.2)] flex flex-col items-center text-center">
          <div className="mb-4">
            <ViceLogo size="md" />
          </div>

          <h1 className="text-2xl font-black text-white font-display mb-1">
            Criar Sua Conta
          </h1>
          <p className="text-xs text-vice-textMuted mb-5">
            Cadastre-se e ative seu plano para acessar o Hub definitivo de conteúdo de GTA 6.
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <div className="text-left">
              <label className="text-[11px] font-semibold text-zinc-300 ml-1 mb-1 block">
                Nome de Usuário / Gamertag
              </label>
              <Input
                size="large"
                prefix={<User className="w-4 h-4 text-vice-textMuted mr-2" />}
                placeholder="Ex: ViceRider99"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="text-left">
              <label className="text-[11px] font-semibold text-zinc-300 ml-1 mb-1 block">
                E-mail
              </label>
              <Input
                size="large"
                type="email"
                prefix={<Mail className="w-4 h-4 text-vice-textMuted mr-2" />}
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="text-left">
              <label className="text-[11px] font-semibold text-zinc-300 ml-1 mb-1 block">
                Senha
              </label>
              <Input.Password
                size="large"
                prefix={<Lock className="w-4 h-4 text-vice-textMuted mr-2" />}
                placeholder="Crie uma senha forte"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Notice about SaaS subscription */}
            <div className="flex flex-col gap-1 text-left bg-[#100B1D]/80 p-3 rounded-xl border border-purple-500/15 my-1 text-[11px] text-zinc-300">
              <div className="flex items-center gap-1.5 text-vice-blue font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Assinatura Comercial Obrigatória:</span>
              </div>
              <p>• O acesso completo ao Trend Radar e AI Clipper requer plano ativo.</p>
              <p>• Planos a partir de R$ 25/mês no ciclo anual.</p>
              <p>• Liberação instantânea no checkout via PIX ou Cartão.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple hover:opacity-95 shadow-[0_0_20px_rgba(255,20,147,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <span>{loading ? 'Criando Conta...' : 'Continuar para Escolha do Plano'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-purple-500/15 w-full text-xs text-vice-textMuted flex items-center justify-center gap-1">
            <span>Já possui uma conta?</span>{' '}
            <Link href="/login" className="text-vice-blue hover:underline font-bold">
              Fazer Login →
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-[11px] text-zinc-600 relative z-10">
        © 2026 VICE CLIPPER • The GTA 6 Clipping Hub • Plataforma Independente
      </footer>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070611] text-white flex items-center justify-center">Carregando...</div>}>
      <CadastroContent />
    </Suspense>
  );
}
