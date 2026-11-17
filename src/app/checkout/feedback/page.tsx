'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ViceLogo } from '@/components/ui/ViceLogo';
import { useAuth } from '@/context/AuthContext';

function FeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession, user } = useAuth();

  const statusParam = searchParams.get('status') || searchParams.get('collection_status');
  const preapprovalId = searchParams.get('preapproval_id');
  const paymentId = searchParams.get('payment_id');

  const [checking, setChecking] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkServerAccess = async () => {
      try {
        const session = await refreshSession();
        if (session?.hasAccess || statusParam === 'approved' || statusParam === 'authorized') {
          setIsApproved(true);
          setChecking(false);
          // Redireciona automaticamente após 3 segundos
          timeoutId = setTimeout(() => {
            router.push('/app');
          }, 3500);
        } else {
          setIsApproved(false);
          setChecking(false);
        }
      } catch (err) {
        setChecking(false);
      }
    };

    checkServerAccess();

    return () => clearTimeout(timeoutId);
  }, [refreshSession, router, statusParam]);

  return (
    <div className="min-h-screen bg-[#070611] text-white flex flex-col justify-between selection:bg-vice-pink selection:text-white">
      {/* Header */}
      <header className="border-b border-purple-500/15 bg-[#0A0618]/90 backdrop-blur-md p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <ViceLogo size="sm" />
          </Link>
          <div className="text-xs text-vice-textMuted flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Retorno Seguro do Mercado Pago</span>
          </div>
        </div>
      </header>

      {/* Main feedback box */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 flex items-center justify-center">
        <div className="w-full bg-[#151027] border border-purple-500/30 rounded-3xl p-8 text-center shadow-[0_15px_45px_rgba(0,0,0,0.7)]">
          {checking ? (
            <div className="py-8">
              <div className="w-16 h-16 rounded-full bg-vice-blue/20 text-vice-blue border border-vice-blue/40 flex items-center justify-center mx-auto mb-4 animate-spin">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black uppercase font-display text-white mb-2">
                Validando com o Mercado Pago...
              </h2>
              <p className="text-xs text-vice-textMuted">
                Confirmando a autorização do pagamento nos servidores oficiais.
              </p>
            </div>
          ) : isApproved ? (
            <div>
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black uppercase font-display text-white mb-2">
                Assinatura Confirmada!
              </h2>
              <p className="text-xs text-vice-textMuted mb-6 leading-relaxed">
                Parabéns! Seu pagamento foi validado diretamente pelo Mercado Pago e seu acesso total à plataforma VICE CLIPPER foi liberado.
              </p>
              {preapprovalId && (
                <div className="p-3 bg-[#0A0618] rounded-xl border border-purple-500/20 text-[11px] font-mono text-zinc-400 mb-6">
                  Identificador: {preapprovalId}
                </div>
              )}
              <Link
                href="/app"
                className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple hover:opacity-95 shadow-[0_0_20px_rgba(255,20,147,0.5)] transition-all flex items-center justify-center gap-2"
              >
                <span>Acessar Plataforma Agora</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black uppercase font-display text-white mb-2">
                Pagamento em Processamento
              </h2>
              <p className="text-xs text-vice-textMuted mb-6 leading-relaxed">
                O Mercado Pago está processando a transação. Assim que o gateway confirmar a compensação bancária, seu acesso será liberado automaticamente.
              </p>
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/app/assinatura"
                  className="w-full py-3 rounded-full text-xs font-bold text-white bg-[#100B1D] border border-purple-500/30 hover:border-vice-pink/60 transition-colors"
                >
                  Verificar Status da Assinatura
                </Link>
                <Link
                  href="/checkout"
                  className="text-xs text-vice-blue hover:underline"
                >
                  Tentar outro método de pagamento
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-[11px] text-zinc-600">
        © 2026 VICE CLIPPER • The GTA 6 Clipping Hub • Integração Oficial Mercado Pago
      </footer>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070611] text-white flex items-center justify-center">Carregando retorno do Mercado Pago...</div>}>
      <FeedbackContent />
    </Suspense>
  );
}
