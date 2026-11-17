import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminUsersList,
  adminUpdateUserSubscription,
  adminToggleUserAdmin,
} from '@/lib/subscriptionStore';

export async function GET() {
  const users = getAdminUsersList();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, planSlug, status, extendMonths, isAdmin } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório.' }, { status: 400 });
    }

    if (action === 'update_subscription') {
      const result = adminUpdateUserSubscription(userId, {
        planSlug,
        status,
        extendMonths: extendMonths ? Number(extendMonths) : undefined,
      });
      return NextResponse.json(result);
    }

    if (action === 'toggle_admin') {
      const result = adminToggleUserAdmin(userId, Boolean(isAdmin));
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Ação administrativa inválida.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro interno.' }, { status: 500 });
  }
}
