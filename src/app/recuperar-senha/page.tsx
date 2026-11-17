'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input, message } from 'antd';
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { ViceLogo } from '@/components/ui/ViceLogo';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      message.success('Instruções de recuperação enviadas com sucesso!');
    }, 800);
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
          href="/login"
          className="text-xs text-vice-textMuted hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para o Login</span>
        </Link>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-[#151027]/90 backdrop-blur-xl border border-[rgba(139,46,255,0.3)] rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(255,20,147,0.2)] flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-vice-pink/20 to-vice-purple/20 border border-vice-pink/30 flex items-center justify-center text-vice-pink mb-4 shadow-[0_0_15px_rgba(255,20,147,0.3)]">
            <KeyRound className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-black text-white font-display mb-1">
            Recuperar Senha
          </h1>

          {!submitted ? (
            <>
              <p className="text-xs text-vice-textMuted mb-6">
                Informe o e-mail cadastrado na sua conta. Enviaremos um link seguro para você redefinir sua senha.
              </p>

              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                <div className="text-left">
                  <label className="text-[11px] font-semibold text-zinc-300 ml-1 mb-1 block">
                    E-mail Cadastrado
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple hover:opacity-95 shadow-[0_0_20px_rgba(255,20,147,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <span>{loading ? 'Enviando...' : 'Enviar Link de Redefinição'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 my-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">E-mail enviado com sucesso!</p>
              <p className="text-xs text-vice-textMuted leading-relaxed">
                Verifique a caixa de entrada de <span className="text-vice-blue font-semibold">{email}</span> e siga as instruções para cadastrar sua nova senha.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs text-vice-pink hover:underline"
              >
                Tentar outro e-mail
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-purple-500/15 w-full flex items-center justify-center text-xs text-vice-textMuted">
            <Link href="/login" className="text-vice-blue hover:underline font-semibold">
              ← Retornar à tela de login
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
