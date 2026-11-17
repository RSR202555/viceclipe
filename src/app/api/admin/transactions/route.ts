import { NextResponse } from 'next/server';
import { getAllAdminPayments } from '@/lib/subscriptionStore';

export async function GET() {
  const transactions = getAllAdminPayments();
  return NextResponse.json(transactions);
}
