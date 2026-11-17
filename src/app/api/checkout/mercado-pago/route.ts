import { NextRequest, NextResponse } from 'next/server';
import { decodeSession, SESSION_COOKIE_NAME } from '@/lib/session';
import { getPlanBySlug, DEFAULT_PLANS } from '@/lib/subscriptionStore';
import { mercadoPagoService } from '@/services/mercadoPagoService';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const rawCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(rawCookie);

    const body = await request.json();
    const { planSlug, userEmail, userName, paymentMethod = 'pix' } = body;

    // 1. Identificar usuário autenticado ou dados de checkout
    const finalEmail = (userEmail || session?.user?.email || '').trim().toLowerCase();
    const finalName = (userName || session?.user?.full_name || 'Criador GTA 6').trim();

    if (!finalEmail) {
      return NextResponse.json(
        { error: 'E-mail do usuário é obrigatório para gerar a assinatura.' },
        { status: 400 }
      );
    }

    if (!planSlug) {
      return NextResponse.json(
        { error: 'Identificador do plano (planSlug) é obrigatório.' },
        { status: 400 }
      );
    }

    // 2. Consultar o plano no banco de dados e validar se está ativo
    let targetPlan = getPlanBySlug(planSlug);

    // Se Supabase estiver configurado, busca diretamente na tabela oficial de planos
    if (isSupabaseConfigured()) {
      const { data: dbPlan, error: planError } = await supabaseAdmin
        .from('plans')
        .select('*')
        .eq('slug', planSlug)
        .eq('is_active', true)
        .single();

      if (dbPlan && !planError) {
        targetPlan = {
          id: dbPlan.id,
          name: dbPlan.name,
          slug: dbPlan.slug,
          tagline: dbPlan.tagline,
          description: dbPlan.description,
          price_cents: dbPlan.price_cents,
          currency: dbPlan.currency,
          billing_interval: dbPlan.billing_interval,
          features: dbPlan.features || [],
          limits: dbPlan.limits || { clips_per_month: 40, max_resolution: '1080p', priority_queue: false },
          is_active: dbPlan.is_active,
          highlighted: dbPlan.highlighted,
        };
      }
    }

    if (!targetPlan || !targetPlan.is_active) {
      return NextResponse.json(
        { error: 'Plano não encontrado ou inativo no banco de dados.' },
        { status: 404 }
      );
    }

    // 3. Garantir Perfil no Banco de Dados para obter UUID oficial
    let userProfileId = session?.user?.id || '';

    if (isSupabaseConfigured()) {
      const sanitizedUsername = finalEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + '_' + Math.random().toString(36).substring(2, 6);
      
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, username')
        .eq('email', finalEmail)
        .single();

      if (existingProfile) {
        userProfileId = existingProfile.id;
      } else {
        const { data: newProfile } = await supabaseAdmin
          .from('profiles')
          .insert({
            full_name: finalName,
            username: sanitizedUsername,
            email: finalEmail,
            avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
          })
          .select('id')
          .single();

        if (newProfile) {
          userProfileId = newProfile.id;
        }
      }
    }

    const checkoutUser = {
      id: userProfileId || `usr_${Date.now()}`,
      full_name: finalName,
      username: finalEmail.split('@')[0],
      email: finalEmail,
      created_at: new Date().toISOString(),
    };

    // 4. Fluxo PIX Oficial do Mercado Pago
    if (paymentMethod === 'pix') {
      const pixPayment = await mercadoPagoService.createPixPayment({
        plan: targetPlan,
        user: checkoutUser,
      });

      // Salva pré-registro da assinatura com status 'incomplete'
      if (isSupabaseConfigured() && userProfileId) {
        const { data: createdSub } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: userProfileId,
            plan_id: targetPlan.id,
            provider: 'mercadopago',
            provider_customer_id: `cus_${userProfileId}`,
            provider_subscription_id: `pix_${pixPayment.id}`,
            status: 'incomplete', // Acesso NÃO liberado ainda
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(
              Date.now() + (targetPlan.billing_interval === 'annual' ? 365 : 30) * 86400000
            ).toISOString(),
            cancel_at_period_end: false,
            metadata: {
              payment_type: 'pix',
              payment_id: pixPayment.id,
              external_reference: pixPayment.external_reference,
              ticket_url: pixPayment.ticket_url,
            },
          })
          .select('id')
          .single();

        // Registra cobrança pendente
        await supabaseAdmin.from('payments').insert({
          user_id: userProfileId,
          subscription_id: createdSub?.id || null,
          provider: 'mercadopago',
          provider_payment_id: String(pixPayment.id),
          amount_cents: targetPlan.price_cents,
          currency: 'BRL',
          status: 'pending',
          payment_method: 'pix',
          receipt_url: pixPayment.ticket_url,
          raw_payload: {
            qr_code: pixPayment.qr_code,
            external_reference: pixPayment.external_reference,
          },
        });
      }

      return NextResponse.json({
        success: true,
        paymentMethod: 'pix',
        paymentId: pixPayment.id,
        qr_code: pixPayment.qr_code,
        qr_code_base64: pixPayment.qr_code_base64,
        ticket_url: pixPayment.ticket_url,
        plan: {
          id: targetPlan.id,
          name: targetPlan.name,
          price_cents: targetPlan.price_cents,
          billing_interval: targetPlan.billing_interval,
        },
      });
    }

    // 5. Fluxo Cartão de Crédito Recorrente (Preapproval)
    const preapproval = await mercadoPagoService.createSubscriptionPreapproval({
      plan: targetPlan,
      user: checkoutUser,
      backUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/feedback`,
    });

    if (isSupabaseConfigured() && userProfileId) {
      await supabaseAdmin.from('subscriptions').insert({
        user_id: userProfileId,
        plan_id: targetPlan.id,
        provider: 'mercadopago',
        provider_customer_id: `cus_${userProfileId}`,
        provider_subscription_id: preapproval.id,
        status: 'incomplete', // Acesso NÃO liberado ainda
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() + (targetPlan.billing_interval === 'annual' ? 365 : 30) * 86400000
        ).toISOString(),
        cancel_at_period_end: false,
        metadata: {
          payment_type: 'credit_card',
          external_reference: preapproval.external_reference,
          init_point: preapproval.init_point,
          plan_slug: targetPlan.slug,
        },
      });
    }

    return NextResponse.json({
      success: true,
      paymentMethod: 'credit_card',
      init_point: preapproval.init_point,
      preapproval_id: preapproval.id,
      external_reference: preapproval.external_reference,
      plan: {
        id: targetPlan.id,
        name: targetPlan.name,
        price_cents: targetPlan.price_cents,
        billing_interval: targetPlan.billing_interval,
      },
    });
  } catch (error: any) {
    console.error('[MercadoPago Checkout Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao iniciar checkout no Mercado Pago.' },
      { status: 500 }
    );
  }
}
