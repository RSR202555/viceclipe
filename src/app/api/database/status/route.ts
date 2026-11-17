import { NextResponse } from 'next/server';
import { testDatabaseConnection, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  const isConfigured = isSupabaseConfigured();
  const testResult = await testDatabaseConnection();

  return NextResponse.json({
    ...testResult,
    configured: isConfigured,
  });
}
