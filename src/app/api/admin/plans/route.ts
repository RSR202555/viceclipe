import { NextRequest, NextResponse } from 'next/server';
import { getAllAdminPlans, adminUpdatePlan } from '@/lib/subscriptionStore';

export async function GET() {
  const plans = getAllAdminPlans();
  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, updates } = body;

    if (!planId) {
      return NextResponse.json({ error: 'planId é obrigatório.' }, { status: 400 });
    }

    const result = adminUpdatePlan(planId, updates || {});
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro interno.' }, { status: 500 });
  }
}
