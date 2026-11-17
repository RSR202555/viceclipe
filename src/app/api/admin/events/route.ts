import { NextResponse } from 'next/server';
import { getAllAdminWebhookEvents } from '@/lib/subscriptionStore';

export async function GET() {
  const events = getAllAdminWebhookEvents();
  return NextResponse.json(events);
}
