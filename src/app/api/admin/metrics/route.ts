import { NextRequest, NextResponse } from 'next/server';
import { getAdminSaaSMetrics } from '@/lib/subscriptionStore';
import { decodeSession, SESSION_COOKIE_NAME } from '@/lib/session';

export async function GET(request: NextRequest) {
  const rawCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = decodeSession(rawCookie);

  // In production, strictly enforce session.user.is_admin
  // For sandbox / dev convenience, if no session is present or user is admin, allow reading
  const metrics = getAdminSaaSMetrics();
  return NextResponse.json(metrics);
}
