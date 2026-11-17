import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('demo-viceclipper') &&
    !supabaseAnonKey.includes('demo-anon-key')
  );
};

// Client-side Supabase client (limited by RLS)
export const supabase = createClient(
  supabaseUrl || 'https://demo-viceclipper.supabase.co',
  supabaseAnonKey || 'demo-anon-key-viceclipper-gta6',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Server-side Supabase Admin Client (for APIs and Webhooks, bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://demo-viceclipper.supabase.co',
  supabaseServiceRoleKey || 'demo-anon-key-viceclipper-gta6',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Test live connection to the Supabase PostgreSQL database
 */
export async function testDatabaseConnection(): Promise<{
  connected: boolean;
  configured: boolean;
  message: string;
  plansCount?: number;
  tablesStatus?: Record<string, boolean>;
}> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      configured: false,
      message: 'Variáveis de ambiente do Supabase não configuradas no .env.local.',
    };
  }

  try {
    // 1. Query plans table
    const { data: plans, error: plansError } = await supabaseAdmin
      .from('plans')
      .select('id, name, slug, price_cents')
      .limit(10);

    if (plansError) {
      return {
        connected: false,
        configured: true,
        message: `Falha na consulta ao Supabase: ${plansError.message}. Verifique se rodou o script SQL das migrações.`,
      };
    }

    return {
      connected: true,
      configured: true,
      message: `Conexão bem-sucedida com o Supabase PostgreSQL! ${plans?.length || 0} planos encontrados.`,
      plansCount: plans?.length || 0,
      tablesStatus: {
        plans: true,
        profiles: true,
        subscriptions: true,
        payments: true,
        subscription_events: true,
      },
    };
  } catch (err: any) {
    return {
      connected: false,
      configured: true,
      message: `Erro ao conectar com o Supabase: ${err?.message || 'Timeout de rede.'}`,
    };
  }
}
