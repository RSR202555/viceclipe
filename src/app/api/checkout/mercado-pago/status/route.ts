export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { mercadoPagoService } from '@/services/mercadoPagoService';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { decodeSession, encodeSession, SESSION_COOKIE_NAME } from '@/lib/session';
import { DEFAULT_PLANS } from '@/lib/subscriptionStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId é obrigatório' }, { status: 400 });
    }

    // Consulta oficial ao Mercado Pago
    const payment = await mercadoPagoService.getPayment(paymentId);

    if (!payment) {
      return NextResponse.json({ approved: false, status: 'not_found' });
    }

    const isApproved = payment.status === 'approved';

    if (isApproved && isSupabaseConfigured()) {
      // Atualiza pagamento para 'paid'
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('provider_payment_id', String(paymentId));

      // Busca o pagamento para identificar o subscription_id e user_id
      const { data: dbPayment } = await supabaseAdmin
        .from('payments')
        .select('subscription_id, user_id')
        .eq('provider_payment_id', String(paymentId))
        .single();

      if (dbPayment?.subscription_id) {
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', dbPayment.subscription_id);
      } else if (dbPayment?.user_id) {
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', dbPayment.user_id);
      }

      // Atualiza a sessão nos cookies
      const rawCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      const currentSession = decodeSession(rawCookie);

      const response = NextResponse.json({
        approved: true,
        status: 'approved',
      });

      if (currentSession?.user) {
        const fallbackPlan = DEFAULT_PLANS.find(p => p.slug === 'vice-clipper-pro-annual') || DEFAULT_PLANS[0];
        const updatedSession = {
          ...currentSession,
          hasAccess: true,
          plan: currentSession.plan || fallbackPlan,
          subscription: currentSession.subscription
            ? { ...currentSession.subscription, status: 'active' as const }
            : null,
        };
        response.cookies.set(SESSION_COOKIE_NAME, encodeSession(updatedSession), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        });
      }

      return response;
    }

    return NextResponse.json({
      approved: isApproved,
      status: payment.status || 'pending',
    });
  } catch (err: any) {
    console.error('[Check Payment Status Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
