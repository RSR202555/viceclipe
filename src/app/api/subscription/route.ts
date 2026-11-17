import { NextRequest, NextResponse } from 'next/server';
import {
  getSubscriptionByUserId,
  getPaymentsByUserId,
  cancelSubscription,
  DEFAULT_PLANS,
  checkHasAccess,
  getUserById,
} from '@/lib/subscriptionStore';
import { decodeSession, encodeSession, SESSION_COOKIE_NAME } from '@/lib/session';

export async function GET(request: NextRequest) {
  const rawCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = decodeSession(rawCookie);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const user = getUserById(session.user.id) || session.user;
  const subscription = getSubscriptionByUserId(user.id);
  const plan = subscription ? DEFAULT_PLANS.find((p) => p.id === subscription.plan_id) || null : null;
  const payments = getPaymentsByUserId(user.id);
  const hasAccess = checkHasAccess(subscription);

  return NextResponse.json({
    user,
    subscription,
    plan,
    payments,
    hasAccess,
  });
}

export async function POST(request: NextRequest) {
  const rawCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = decodeSession(rawCookie);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'cancel') {
      const result = cancelSubscription(session.user.id);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      // Update cookie
      const updatedSub = getSubscriptionByUserId(session.user.id);
      const updatedSession = {
        ...session,
        subscription: updatedSub,
      };

      const response = NextResponse.json({ success: true, message: result.message });
      response.cookies.set(SESSION_COOKIE_NAME, encodeSession(updatedSession), {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }

    return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro interno.' }, { status: 500 });
  }
}
