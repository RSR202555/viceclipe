import { NextRequest, NextResponse } from 'next/server';
import { processPaymentWebhook, WebhookPaymentPayload } from '@/lib/subscriptionStore';
import { encodeSession, SESSION_COOKIE_NAME } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as WebhookPaymentPayload;

    // Validate required fields
    if (!payload.user_email || !payload.provider_payment_id || !payload.plan_slug) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes no webhook: user_email, provider_payment_id, plan_slug' },
        { status: 400 }
      );
    }

    // Ensure provider_event_id exists (use provider_payment_id if not explicitly provided)
    if (!payload.provider_event_id) {
      payload.provider_event_id = `evt_${payload.provider_payment_id}`;
    }

    // Process payment through idempotent storage engine
    const result = processPaymentWebhook(payload);

    const response = NextResponse.json({
      success: result.success,
      duplicate: result.duplicate,
      message: result.message,
      session: result.session,
    });

    // Automatically set or update the session cookie so the user immediately has authorized access
    response.cookies.set(SESSION_COOKIE_NAME, encodeSession(result.session), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha no processamento do webhook.' },
      { status: 500 }
    );
  }
}
