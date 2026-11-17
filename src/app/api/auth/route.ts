import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateUser,
  getSubscriptionByUserId,
  DEFAULT_PLANS,
  checkHasAccess,
} from '@/lib/subscriptionStore';
import { decodeSession, encodeSession, SESSION_COOKIE_NAME } from '@/lib/session';
import { UserSession } from '@/types/saas';

export async function GET(request: NextRequest) {
  const rawCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = decodeSession(rawCookie);

  if (!session) {
    return NextResponse.json({ authenticated: false, session: null }, { status: 200 });
  }

  // Refresh latest subscription status from store
  const currentSub = getSubscriptionByUserId(session.user.id);
  const currentPlan = currentSub ? DEFAULT_PLANS.find((p) => p.id === currentSub.plan_id) || null : null;
  const hasAccess = checkHasAccess(currentSub);

  const freshSession: UserSession = {
    user: session.user,
    subscription: currentSub,
    plan: currentPlan,
    hasAccess,
  };

  const response = NextResponse.json({ authenticated: true, session: freshSession });

  // Update cookie with latest state
  response.cookies.set(SESSION_COOKIE_NAME, encodeSession(freshSession), {
    path: '/',
    httpOnly: false, // Accessible to client auth provider as well
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, name, username } = body;

    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logout efetuado com sucesso.' });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 });
    }

    // Login or Signup
    const user = getOrCreateUser(email, name, username);
    const adminEmails = ['rianflamengo8@gmail.com', 'soncarvv@gmail.com'];
    if (adminEmails.includes(email.toLowerCase()) || email.toLowerCase().endsWith('@viceclipper.com')) {
      user.is_admin = true;
    }
    const subscription = getSubscriptionByUserId(user.id);
    const plan = subscription ? DEFAULT_PLANS.find((p) => p.id === subscription.plan_id) || null : null;
    const hasAccess = checkHasAccess(subscription);

    const session: UserSession = {
      user,
      subscription,
      plan,
      hasAccess,
    };

    const response = NextResponse.json({
      success: true,
      message: action === 'signup' ? 'Conta criada com sucesso!' : 'Login realizado com sucesso!',
      session,
    });

    response.cookies.set(SESSION_COOKIE_NAME, encodeSession(session), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}
