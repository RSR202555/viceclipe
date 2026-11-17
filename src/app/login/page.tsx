'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, message } from 'antd';
import { Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ViceLogo } from '@/components/ui/ViceLogo';
import { useAuth } from '@/context/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const redirectParam = searchParams.get('redirect') || '/app';
  const planoParam = searchParams.get('plano');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      const res = await login(email);
      if (res.success && res.session) {
        message.success('Login efetuado com sucesso!');

        // Check if user has active subscription
        if (res.session.hasAccess) {
          router.push(redirectParam);
        } else {
          // If no active subscription, redirect to checkout or plans
          if (planoParam) {
            router.push(`/checkout?plano=${planoParam}`);
          } else {
            router.push(`/planos?error=subscription_required&redirect=${encodeURIComponent(redirectParam)}`);
          }
        }
      } else {
        message.error(res.error || 'Erro ao efetuar login.');
      }
    } catch (err: any) {
      message.error('Erro de conexão ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070611] text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-pink-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/15 blur-[130px] pointer-events-none" />

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

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-[#151027]/90 backdrop-blur-xl border border-[rgba(139,46,255,0.3)] rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(255,20,147,0.2)] flex flex-col items-center text-center">
          <div className="mb-4">
            <ViceLogo size="md" />
          </div>

          <h1 className="text-2xl font-black text-white font-display mb-1">
            Acessar Plataforma
          </h1>
          <p className="text-xs text-vice-textMuted mb-6">
            Entre na sua conta para acessar o Trend Radar e suas ferramentas de clipes de GTA 6.
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
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
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-zinc-300 ml-1 block">
                  Senha
                </label>
                <Link
                  href="/recuperar-senha"
                  className="text-[11px] text-vice-pink hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input.Password
                size="large"
                prefix={<Lock className="w-4 h-4 text-vice-textMuted mr-2" />}
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple hover:opacity-95 shadow-[0_0_20px_rgba(255,20,147,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{loading ? 'Validando Acesso...' : 'Entrar no VICE CLIPPER'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-purple-500/15 w-full flex flex-col gap-2.5 text-xs text-vice-textMuted">
            <p>
              Não possui uma assinatura?{' '}
              <Link href="/planos" className="text-vice-pink hover:underline font-bold">
                Conheça nossos planos
              </Link>
            </p>
            <p>
              Ainda não tem conta?{' '}
              <Link
                href={`/cadastro${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
                className="text-vice-blue hover:underline font-semibold"
              >
                Cadastre-se aqui →
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="p-4 text-center text-[11px] text-zinc-600 relative z-10">
        © 2026 VICE CLIPPER • The GTA 6 Clipping Hub • Plataforma Independente
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070611] text-white flex items-center justify-center">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
