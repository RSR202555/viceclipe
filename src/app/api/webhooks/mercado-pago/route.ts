import { NextRequest, NextResponse } from 'next/server';
import { mercadoPagoService, MercadoPagoWebhookNotification } from '@/services/mercadoPagoService';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let notification: MercadoPagoWebhookNotification;

    try {
      notification = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Corpo da requisição JSON inválido.' }, { status: 400 });
    }

    // 1. Extração dos identificadores do evento
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    // Determina o ID do recurso e o tipo do evento
    const dataId = notification.data?.id || (notification.id ? String(notification.id) : '');
    const eventType = notification.type || notification.topic || 'payment';
    const action = notification.action || 'updated';

    if (!dataId) {
      // Notificação sem ID de recurso não pode ser consultada
      return NextResponse.json({ received: true, note: 'Sem data.id para consulta' }, { status: 200 });
    }

    // 2. Validação da Assinatura Criptográfica (HMAC SHA-256)
    const signatureCheck = mercadoPagoService.validateWebhookSignature({
      xSignature,
      xRequestId,
      dataId,
    });

    if (!signatureCheck.valid) {
      console.warn(`[MercadoPago Webhook] Assinatura inválida: ${signatureCheck.reason}`);
      return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 });
    }

    // 3. Idempotência: Verificar se o evento já foi processado
    const providerEventId = `evt_mp_${dataId}_${action}_${notification.date_created || Date.now()}`;

    if (isSupabaseConfigured()) {
      const { data: existingEvent } = await supabaseAdmin
        .from('subscription_events')
        .select('id')
        .eq('provider', 'mercadopago')
        .eq('provider_event_id', providerEventId)
        .single();

      if (existingEvent) {
        console.log(`[MercadoPago Webhook] Evento ${providerEventId} já processado anteriormente.`);
        return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
      }
    }

    // 4. REGRA DE OURO: CONSULTA DIRETA DO RECURSO NA API DO MERCADO PAGO
    // Nunca liberar acesso somente com base no payload recebido do webhook
    let isAuthorized = false;
    let isCanceled = false;
    let payerEmail = '';
    let externalRef = '';
    let preapprovalId = '';
    let paymentAmountCents = 0;
    let paymentMethod = 'credit_card';

    if (eventType === 'subscription_preapproval' || eventType === 'preapproval') {
      const preapproval = await mercadoPagoService.getSubscription(dataId);

      if (!preapproval) {
        console.error(`[MercadoPago Webhook] Preapproval ${dataId} não encontrado na API oficial.`);
        return NextResponse.json({ error: 'Recurso não encontrado na API do Mercado Pago.' }, { status: 404 });
      }

      preapprovalId = preapproval.id;
      payerEmail = preapproval.payer_email;
      externalRef = preapproval.external_reference || '';
      isAuthorized = preapproval.status === 'authorized';
      isCanceled = preapproval.status === 'cancelled' || preapproval.status === 'paused';
      paymentAmountCents = Math.round((preapproval.auto_recurring?.transaction_amount || 0) * 100);
    } else if (eventType === 'payment') {
      const payment = await mercadoPagoService.getPayment(dataId);

      if (!payment) {
        console.error(`[MercadoPago Webhook] Payment ${dataId} não encontrado na API oficial.`);
        return NextResponse.json({ error: 'Pagamento não encontrado na API do Mercado Pago.' }, { status: 404 });
      }

      payerEmail = payment.payer?.email || '';
      externalRef = payment.external_reference || '';
      isAuthorized = payment.status === 'approved';
      isCanceled = payment.status === 'rejected' || payment.status === 'cancelled' || payment.status === 'refunded';
      paymentAmountCents = Math.round((payment.transaction_amount || 0) * 100);
      paymentMethod = payment.payment_type_id === 'bank_transfer' || payment.payment_method_id === 'pix' ? 'pix' : 'credit_card';
    } else if (
      eventType === 'subscription_authorized_payment' ||
      eventType === 'authorized_payment'
    ) {
      const authPayment = await mercadoPagoService.getAuthorizedPayment(dataId);
      if (authPayment) {
        isAuthorized = authPayment.status === 'approved';
        preapprovalId = authPayment.preapproval_id;
        paymentAmountCents = Math.round((authPayment.transaction_amount || 0) * 100);
      }
    }

    // 5. Atualização do Banco de Dados com base no Recurso Verificado
    if (isSupabaseConfigured()) {
      // Registrar evento na tabela de idempotência
      await supabaseAdmin.from('subscription_events').insert({
        provider: 'mercadopago',
        provider_event_id: providerEventId,
        event_type: eventType,
        payload: {
          dataId,
          action,
          isAuthorized,
          payerEmail,
          paymentAmountCents,
        },
      });

      // Identificar o usuário através de external_reference (formato: vc_userId__planId__timestamp) ou e-mail
      let userId: string | null = null;
      let planId: string | null = null;

      if (externalRef && externalRef.startsWith('vc_')) {
        const parts = externalRef.replace('vc_', '').split('__');
        userId = parts[0] || null;
        planId = parts[1] || null;
      }

      // Se preapprovalId existir, tenta localizar registro de assinatura preliminar
      if ((!userId || !planId) && preapprovalId) {
        const { data: prelimSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id, plan_id')
          .eq('provider_subscription_id', preapprovalId)
          .single();

        if (prelimSub) {
          if (!userId) userId = prelimSub.user_id;
          if (!planId) planId = prelimSub.plan_id;
        }
      }

      // Localização por e-mail no perfil se ainda não encontrado
      if (!userId && payerEmail) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', payerEmail)
          .single();
        if (profile) userId = profile.id;
      }

      // Validar ou obter UUID do plano
      if (planId && !planId.includes('-')) {
        const { data: foundPlan } = await supabaseAdmin
          .from('plans')
          .select('id')
          .eq('slug', planId)
          .single();
        if (foundPlan) planId = foundPlan.id;
      }

      if (userId) {
        if (isAuthorized) {
          // LIBERAÇÃO EFETIVA DO ACESSO: Assinatura Ativa
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);

          // Verifica se já existe registro de assinatura para esse usuário
          const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          let targetSubId = existingSub?.id;

          if (existingSub) {
            await supabaseAdmin
              .from('subscriptions')
              .update({
                plan_id: planId || '00000000-0000-0000-0000-000000000002',
                provider: 'mercadopago',
                provider_subscription_id: preapprovalId || `sub_${dataId}`,
                status: 'active',
                current_period_start: startDate.toISOString(),
                current_period_end: endDate.toISOString(),
                cancel_at_period_end: false,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingSub.id);
          } else {
            const { data: newSub } = await supabaseAdmin
              .from('subscriptions')
              .insert({
                user_id: userId,
                plan_id: planId || '00000000-0000-0000-0000-000000000002',
                provider: 'mercadopago',
                provider_subscription_id: preapprovalId || `sub_${dataId}`,
                status: 'active',
                current_period_start: startDate.toISOString(),
                current_period_end: endDate.toISOString(),
                cancel_at_period_end: false,
              })
              .select('id')
              .single();
            targetSubId = newSub?.id;
          }

          // Registrar pagamento confirmado com idempotência em provider_payment_id
          if (paymentAmountCents > 0) {
            await supabaseAdmin.from('payments').upsert(
              {
                user_id: userId,
                subscription_id: targetSubId || null,
                provider: 'mercadopago',
                provider_payment_id: `mp_pay_${dataId}`,
                amount_cents: paymentAmountCents,
                currency: 'BRL',
                status: 'paid',
                payment_method: paymentMethod,
                paid_at: new Date().toISOString(),
                receipt_url: `/app/assinatura/recibo/mp_pay_${dataId}`,
              },
              { onConflict: 'provider_payment_id' }
            );
          }
        } else if (isCanceled) {
          // CANCELAMENTO OU FALHA: Atualizar status
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        }
      }
    }

    return NextResponse.json({
      received: true,
      data_id: dataId,
      authorized: isAuthorized,
    });
  } catch (err: any) {
    console.error('[MercadoPago Webhook Error]:', err);
    return NextResponse.json({ error: err.message || 'Erro interno no webhook.' }, { status: 500 });
  }
}
