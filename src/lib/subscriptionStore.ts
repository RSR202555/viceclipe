import {
  Plan,
  Subscription,
  PaymentRecord,
  UserProfile,
  UserSession,
  WebhookEventRecord,
  AdminUserListItem,
  AdminSaaSMetrics,
} from '@/types/saas';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

// Master Plans Catalog
export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'plan_vice_clipper_monthly',
    name: 'Vice Clipper',
    slug: 'vice-clipper-monthly',
    tagline: 'Ideal para criadores em ascensão e clipadores entusiastas.',
    description: 'Acesso essencial às tendências do GTA 6 e exportações Full HD.',
    price_cents: 3000, // R$ 30,00
    currency: 'BRL',
    billing_interval: 'monthly',
    features: [
      'Acesso completo ao Trend Radar de Leonida',
      'Criação de até 40 clipes inteligentes por mês',
      'Exportação em Full HD (1080p a 60 FPS)',
      'Enquadramento automático 9:16 (TikTok, Reels e Shorts)',
      'Sem marca d’água da plataforma',
      'Armazenamento em nuvem de clipes favoritos',
      'Acesso à comunidade e feed de criadores',
    ],
    limits: {
      clips_per_month: 40,
      max_resolution: '1080p',
      priority_queue: false,
    },
    is_active: true,
    highlighted: false,
  },
  {
    id: 'plan_vice_clipper_pro_monthly',
    name: 'Vice Clipper PRO',
    slug: 'vice-clipper-pro-monthly',
    tagline: 'Poder máximo para streamers profissionais e canais de elite.',
    description: 'Recursos ilimitados com renderização 4K e IA preditiva de GTA 6.',
    price_cents: 5000, // R$ 50,00
    currency: 'BRL',
    billing_interval: 'monthly',
    features: [
      'Tudo incluso no plano Vice Clipper e mais:',
      'Clipes inteligentes ILIMITADOS por mês',
      'Exportação máxima em Ultra HD 4K a 60 FPS',
      'Fila prioritária com renderização ultrarrápida',
      'Detecção neural avançada de perseguições, áudio e tiroteios',
      'Legendas automáticas estilizadas e sincronizadas',
      'Creator Studio PRO com métricas e insights preditivos',
      'Selo exclusivo de Criador PRO Verificado no perfil',
    ],
    limits: {
      clips_per_month: -1,
      max_resolution: '4k',
      priority_queue: true,
    },
    is_active: true,
    highlighted: true,
  },
  {
    id: 'plan_vice_clipper_annual',
    name: 'Vice Clipper Anual',
    slug: 'vice-clipper-annual',
    tagline: 'Ideal para criadores com economia no plano anual.',
    description: 'Acesso essencial às tendências do GTA 6 por R$ 25/mês.',
    price_cents: 30000, // R$ 300,00 (R$ 25/mês)
    currency: 'BRL',
    billing_interval: 'annual',
    features: [
      'Equivalente a R$ 25/mês (Economia de R$ 60 no ano)',
      'Acesso completo ao Trend Radar de Leonida',
      'Criação de até 40 clipes inteligentes por mês',
      'Exportação em Full HD (1080p a 60 FPS)',
      'Enquadramento automático 9:16 (TikTok, Reels e Shorts)',
      'Sem marca d’água da plataforma',
      'Armazenamento em nuvem de clipes favoritos',
      'Acesso à comunidade e feed de criadores',
    ],
    limits: {
      clips_per_month: 40,
      max_resolution: '1080p',
      priority_queue: false,
    },
    is_active: true,
    highlighted: false,
  },
  {
    id: 'plan_vice_clipper_pro_annual',
    name: 'Vice Clipper PRO Anual',
    slug: 'vice-clipper-pro-annual',
    tagline: 'Poder máximo para streamers com super desconto no ano.',
    description: 'Recursos ilimitados com IA preditiva por R$ 45/mês.',
    price_cents: 54000, // R$ 540,00 (R$ 45/mês)
    currency: 'BRL',
    billing_interval: 'annual',
    features: [
      'Equivalente a R$ 45/mês (Economia de R$ 60 no ano)',
      'Tudo incluso no plano Vice Clipper e mais:',
      'Clipes inteligentes ILIMITADOS por mês',
      'Exportação máxima em Ultra HD 4K a 60 FPS',
      'Fila prioritária com renderização ultrarrápida',
      'Detecção neural avançada de perseguições, áudio e tiroteios',
      'Legendas automáticas estilizadas e sincronizadas',
      'Creator Studio PRO com métricas e insights preditivos',
      'Selo exclusivo de Criador PRO Verificado no perfil',
    ],
    limits: {
      clips_per_month: -1,
      max_resolution: '4k',
      priority_queue: true,
    },
    is_active: true,
    highlighted: true,
  },
];

// Helper to find a plan by slug or shorthand
export function getPlanBySlug(slug: string): Plan | undefined {
  if (!slug) return DEFAULT_PLANS[0];
  const normalized = slug.toLowerCase().trim();
  if (normalized === 'clipper' || normalized === 'vice-clipper') {
    return DEFAULT_PLANS[0];
  }
  if (normalized === 'pro' || normalized === 'vice-clipper-pro') {
    return DEFAULT_PLANS[1];
  }
  return DEFAULT_PLANS.find((p) => p.slug === normalized) || DEFAULT_PLANS[0];
}

// Global In-Memory Store for Server Runtime
interface StoreState {
  users: Map<string, UserProfile>;
  subscriptions: Map<string, Subscription>; // keyed by userId
  payments: PaymentRecord[];
  processedEvents: Set<string>; // keyed by `${provider}:${eventId}` for idempotency
  eventsLog: WebhookEventRecord[];
  plans: Plan[];
}

// Declared globally across HMR cycles
const globalStore: StoreState = (global as any).__VICE_SAAS_STORE__ || {
  users: new Map<string, UserProfile>(),
  subscriptions: new Map<string, Subscription>(),
  payments: [],
  processedEvents: new Set<string>(),
  eventsLog: [],
  plans: [...DEFAULT_PLANS],
};

if (process.env.NODE_ENV !== 'production') {
  (global as any).__VICE_SAAS_STORE__ = globalStore;
}

// Initialize Initial Seed Data if empty
if (globalStore.users.size === 0) {
  // 0. Super Admin Founder: Rian Moreno
  const rianId = '4c81a4f5-1af3-46b7-9040-138a0f33e4c7';
  globalStore.users.set(rianId, {
    id: rianId,
    full_name: 'Rian Moreno',
    username: 'rian_admin',
    email: 'rianflamengo8@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Super Administrador e Fundador Oficial do VICE CLIPPER',
    is_admin: true,
    created_at: new Date().toISOString(),
  });
  globalStore.subscriptions.set(rianId, {
    id: 'sub_rian_founder_01',
    user_id: rianId,
    plan_id: 'plan_vice_clipper_pro_annual',
    provider: 'mercadopago',
    provider_customer_id: 'cus_rian_founder',
    provider_subscription_id: 'sub_ext_rian_founder',
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 10 * 365 * 86400000).toISOString(),
    cancel_at_period_end: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  globalStore.payments.push({
    id: 'pay_rian_founder_01',
    user_id: rianId,
    subscription_id: 'sub_rian_founder_01',
    provider_payment_id: 'mp_pay_founder_rian',
    amount_cents: 54000,
    currency: 'BRL',
    status: 'paid',
    payment_method: 'credit_card',
    paid_at: new Date().toISOString(),
    receipt_url: '/app/assinatura/recibo/mp_pay_founder_rian',
    created_at: new Date().toISOString(),
  });

  const soncarvId = '98fe0d6f-50d5-404e-9cd4-909a5a5cc4b7';
  globalStore.users.set(soncarvId, {
    id: soncarvId,
    full_name: 'Admin Soncarv',
    username: 'soncarvv',
    email: 'soncarvv@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Administrador Oficial do VICE CLIPPER',
    is_admin: true,
    created_at: new Date().toISOString(),
  });
  globalStore.subscriptions.set(soncarvId, {
    id: 'sub_soncarv_admin_01',
    user_id: soncarvId,
    plan_id: 'plan_vice_clipper_pro_annual',
    provider: 'mercadopago',
    provider_customer_id: 'cus_soncarv_admin',
    provider_subscription_id: 'sub_admin_soncarvv',
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 10 * 365 * 86400000).toISOString(),
    cancel_at_period_end: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // 1. Super Admin: Lucia Caminos
  const luciaId = 'usr_leonida_creator_01';
  globalStore.users.set(luciaId, {
    id: luciaId,
    full_name: 'Lucia Caminos',
    username: 'lucia_vice',
    email: 'lucia@viceclipper.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Super Administradora do VICE CLIPPER Hub',
    is_admin: true,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  });
  globalStore.subscriptions.set(luciaId, {
    id: 'sub_admin_01',
    user_id: luciaId,
    plan_id: 'plan_vice_clipper_pro_annual',
    provider: 'mercadopago',
    provider_customer_id: 'cus_admin_01',
    provider_subscription_id: 'sub_ext_01',
    status: 'active',
    current_period_start: new Date(Date.now() - 45 * 86400000).toISOString(),
    current_period_end: new Date(Date.now() + 320 * 86400000).toISOString(),
    cancel_at_period_end: false,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  });
  globalStore.payments.push({
    id: 'pay_init_01',
    user_id: luciaId,
    subscription_id: 'sub_admin_01',
    provider_payment_id: 'mp_pay_998182',
    amount_cents: 54000,
    currency: 'BRL',
    status: 'paid',
    payment_method: 'credit_card',
    paid_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    receipt_url: '/app/assinatura/recibo/mp_pay_998182',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  });

  // 2. Admin: Leo Vice
  const leoId = 'usr_leo_vice_02';
  globalStore.users.set(leoId, {
    id: leoId,
    full_name: 'Leo Vice',
    username: 'leo_vice',
    email: 'leo@viceclipper.com',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Arquiteto de Conteúdo & Administrador',
    is_admin: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  });
  globalStore.subscriptions.set(leoId, {
    id: 'sub_leo_02',
    user_id: leoId,
    plan_id: 'plan_vice_clipper_pro_annual',
    provider: 'pix',
    provider_customer_id: 'cus_leo_02',
    provider_subscription_id: 'sub_leo_ext_02',
    status: 'active',
    current_period_start: new Date(Date.now() - 30 * 86400000).toISOString(),
    current_period_end: new Date(Date.now() + 335 * 86400000).toISOString(),
    cancel_at_period_end: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  });
  globalStore.payments.push({
    id: 'pay_init_02',
    user_id: leoId,
    subscription_id: 'sub_leo_02',
    provider_payment_id: 'pix_pay_554109',
    amount_cents: 54000,
    currency: 'BRL',
    status: 'paid',
    payment_method: 'pix',
    paid_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    receipt_url: '/app/assinatura/recibo/pix_pay_554109',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  });

  // 3. User: Rodrigo GTA (PRO Mensal)
  const rodrigoId = 'usr_rodrigo_03';
  globalStore.users.set(rodrigoId, {
    id: rodrigoId,
    full_name: 'Rodrigo Silveira',
    username: 'rodrigogta',
    email: 'rodrigo.gamer@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    bio: 'Criador de cortes diários de GTA 6',
    is_admin: false,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  });
  globalStore.subscriptions.set(rodrigoId, {
    id: 'sub_rodrigo_03',
    user_id: rodrigoId,
    plan_id: 'plan_vice_clipper_pro_monthly',
    provider: 'mercadopago',
    provider_customer_id: 'cus_rodrigo_03',
    provider_subscription_id: 'sub_rodrigo_ext_03',
    status: 'active',
    current_period_start: new Date(Date.now() - 20 * 86400000).toISOString(),
    current_period_end: new Date(Date.now() + 10 * 86400000).toISOString(),
    cancel_at_period_end: false,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  });
  globalStore.payments.push({
    id: 'pay_init_03',
    user_id: rodrigoId,
    subscription_id: 'sub_rodrigo_03',
    provider_payment_id: 'mp_pay_772183',
    amount_cents: 5000,
    currency: 'BRL',
    status: 'paid',
    payment_method: 'credit_card',
    paid_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    receipt_url: '/app/assinatura/recibo/mp_pay_772183',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  });

  // 4. User: Beatriz Leonida (Vice Clipper Mensal)
  const beatrizId = 'usr_beatriz_04';
  globalStore.users.set(beatrizId, {
    id: beatrizId,
    full_name: 'Beatriz Almeida',
    username: 'biaclips',
    email: 'beatriz.clips@outlook.com',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Editora de reels de games e humor',
    is_admin: false,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  });
  globalStore.subscriptions.set(beatrizId, {
    id: 'sub_beatriz_04',
    user_id: beatrizId,
    plan_id: 'plan_vice_clipper_monthly',
    provider: 'pix',
    provider_customer_id: 'cus_beatriz_04',
    provider_subscription_id: 'sub_beatriz_ext_04',
    status: 'active',
    current_period_start: new Date(Date.now() - 15 * 86400000).toISOString(),
    current_period_end: new Date(Date.now() + 15 * 86400000).toISOString(),
    cancel_at_period_end: false,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  });
  globalStore.payments.push({
    id: 'pay_init_04',
    user_id: beatrizId,
    subscription_id: 'sub_beatriz_04',
    provider_payment_id: 'pix_pay_908311',
    amount_cents: 3000,
    currency: 'BRL',
    status: 'paid',
    payment_method: 'pix',
    paid_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    receipt_url: '/app/assinatura/recibo/pix_pay_908311',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  });

  // 5. User: Carlos Streamer (Vice Clipper Anual)
  const carlosId = 'usr_carlos_05';
  globalStore.users.set(carlosId, {
    id: carlosId,
    full_name: 'Carlos Eduardo',
    username: 'carlostv',
    email: 'carlos.tv@twitch.tv',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Streamer diário com 50k seguidores',
    is_admin: false,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  });
  globalStore.subscriptions.set(carlosId, {
    id: 'sub_carlos_05',
    user_id: carlosId,
    plan_id: 'plan_vice_clipper_annual',
    provider: 'mercadopago',
    provider_customer_id: 'cus_carlos_05',
    provider_subscription_id: 'sub_carlos_ext_05',
    status: 'active',
    current_period_start: new Date(Date.now() - 10 * 86400000).toISOString(),
    current_period_end: new Date(Date.now() + 355 * 86400000).toISOString(),
    cancel_at_period_end: false,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  });
  globalStore.payments.push({
    id: 'pay_init_05',
    user_id: carlosId,
    subscription_id: 'sub_carlos_05',
    provider_payment_id: 'mp_pay_332190',
    amount_cents: 30000,
    currency: 'BRL',
    status: 'paid',
    payment_method: 'credit_card',
    paid_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    receipt_url: '/app/assinatura/recibo/mp_pay_332190',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  });

  // 6. User: Marcos Speed (Canceled Subscription)
  const marcosId = 'usr_marcos_06';
  globalStore.users.set(marcosId, {
    id: marcosId,
    full_name: 'Marcos Speed',
    username: 'marcosspeed',
    email: 'marcos.speed@yahoo.com',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Gamer casual',
    is_admin: false,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  });
  globalStore.subscriptions.set(marcosId, {
    id: 'sub_marcos_06',
    user_id: marcosId,
    plan_id: 'plan_vice_clipper_monthly',
    provider: 'mercadopago',
    provider_customer_id: 'cus_marcos_06',
    provider_subscription_id: 'sub_marcos_ext_06',
    status: 'canceled',
    current_period_start: new Date(Date.now() - 60 * 86400000).toISOString(),
    current_period_end: new Date(Date.now() - 30 * 86400000).toISOString(),
    cancel_at_period_end: true,
    canceled_at: new Date(Date.now() - 32 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 32 * 86400000).toISOString(),
  });

  // Initial Events Log
  globalStore.eventsLog.push(
    {
      id: 'evt_log_01',
      provider: 'mercadopago',
      provider_event_id: 'evt_mp_pay_998182',
      event_type: 'payment.success',
      payload: { user_email: 'lucia@viceclipper.com', amount_cents: 54000, plan: 'vice-clipper-pro-annual' },
      duplicate: false,
      processed_at: new Date(Date.now() - 45 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      id: 'evt_log_02',
      provider: 'pix',
      provider_event_id: 'evt_pix_pay_554109',
      event_type: 'payment.success',
      payload: { user_email: 'leo@viceclipper.com', amount_cents: 54000, plan: 'vice-clipper-pro-annual' },
      duplicate: false,
      processed_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'evt_log_03',
      provider: 'mercadopago',
      provider_event_id: 'evt_mp_pay_772183',
      event_type: 'payment.success',
      payload: { user_email: 'rodrigo.gamer@gmail.com', amount_cents: 5000, plan: 'vice-clipper-pro-monthly' },
      duplicate: false,
      processed_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    }
  );
}

/**
 * Validates whether a given subscription allows platform access
 */
export function checkHasAccess(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    const expiresAt = new Date(subscription.current_period_end).getTime();
    return expiresAt > Date.now();
  }
  return false;
}

/**
 * Get or register user
 */
export function getOrCreateUser(email: string, fullName?: string, username?: string): UserProfile {
  for (const user of Array.from(globalStore.users.values())) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      return user;
    }
  }

  const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanUsername = (username || email.split('@')[0] || 'vice_user').replace(/[^a-zA-Z0-9_]/g, '');
  const isAdmin =
    email.toLowerCase().endsWith('@viceclipper.com') ||
    email.toLowerCase().includes('admin') ||
    email.toLowerCase() === 'rianflamengo8@gmail.com' ||
    email.toLowerCase() === 'soncarvv@gmail.com';

  const newUser: UserProfile = {
    id: newId,
    full_name: fullName || 'Criador GTA 6',
    username: cleanUsername,
    email: email.toLowerCase(),
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Membro da comunidade VICE CLIPPER',
    is_admin: isAdmin,
    created_at: new Date().toISOString(),
  };

  globalStore.users.set(newId, newUser);
  return newUser;
}

export function getUserById(id: string): UserProfile | undefined {
  return globalStore.users.get(id);
}

export function getSubscriptionByUserId(userId: string): Subscription | null {
  return globalStore.subscriptions.get(userId) || null;
}

export function getPaymentsByUserId(userId: string): PaymentRecord[] {
  return globalStore.payments.filter((p) => p.user_id === userId);
}

/**
 * Idempotent Webhook Processor for Payments
 */
export interface WebhookPaymentPayload {
  provider: 'mercadopago' | 'stripe' | 'pix' | 'simulator';
  provider_event_id: string;
  event_type: 'payment.success' | 'subscription.created' | 'payment.failed';
  user_email: string;
  user_name?: string;
  plan_slug: string;
  amount_cents: number;
  payment_method: 'pix' | 'credit_card' | 'boleto';
  provider_payment_id: string;
}

export function processPaymentWebhook(payload: WebhookPaymentPayload): {
  success: boolean;
  duplicate: boolean;
  session: UserSession;
  message: string;
} {
  const eventKey = `${payload.provider}:${payload.provider_event_id}`;

  // 1. Idempotency Check
  if (globalStore.processedEvents.has(eventKey)) {
    const user = getOrCreateUser(payload.user_email, payload.user_name);
    const subscription = getSubscriptionByUserId(user.id);
    const plan = subscription ? globalStore.plans.find((p) => p.id === subscription.plan_id) || null : null;

    // Log duplicate event
    globalStore.eventsLog.unshift({
      id: `evt_log_${Date.now()}`,
      provider: payload.provider,
      provider_event_id: payload.provider_event_id,
      event_type: payload.event_type,
      payload,
      duplicate: true,
      processed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      duplicate: true,
      message: 'Evento já processado anteriormente (Idempotência garantida).',
      session: {
        user,
        subscription,
        plan,
        hasAccess: checkHasAccess(subscription),
      },
    };
  }

  // 2. Mark event as processed
  globalStore.processedEvents.add(eventKey);

  // 3. Retrieve or create user
  const user = getOrCreateUser(payload.user_email, payload.user_name);
  const targetPlan = getPlanBySlug(payload.plan_slug) || globalStore.plans[0];

  // 4. Calculate period end
  const startDate = new Date();
  const endDate = new Date(startDate);
  if (targetPlan.billing_interval === 'annual') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  // 5. Create or update subscription
  const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const updatedSubscription: Subscription = {
    id: subscriptionId,
    user_id: user.id,
    plan_id: targetPlan.id,
    provider: payload.provider,
    provider_customer_id: `cus_${user.id}`,
    provider_subscription_id: `sub_${payload.provider_payment_id}`,
    status: 'active',
    current_period_start: startDate.toISOString(),
    current_period_end: endDate.toISOString(),
    cancel_at_period_end: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  globalStore.subscriptions.set(user.id, updatedSubscription);

  // 6. Record payment history
  const paymentRecord: PaymentRecord = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: user.id,
    subscription_id: subscriptionId,
    provider_payment_id: payload.provider_payment_id,
    amount_cents: payload.amount_cents,
    currency: 'BRL',
    status: 'paid',
    payment_method: payload.payment_method,
    paid_at: new Date().toISOString(),
    receipt_url: `/app/assinatura/recibo/${payload.provider_payment_id}`,
    created_at: new Date().toISOString(),
  };

  globalStore.payments.unshift(paymentRecord);

  // 7. Add to events log
  globalStore.eventsLog.unshift({
    id: `evt_log_${Date.now()}`,
    provider: payload.provider,
    provider_event_id: payload.provider_event_id,
    event_type: payload.event_type,
    payload,
    duplicate: false,
    processed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });

  // 8. Asynchronous Sync to Supabase PostgreSQL
  if (isSupabaseConfigured()) {
    (async () => {
      try {
        await supabaseAdmin.from('subscription_events').upsert({
          provider: payload.provider,
          provider_event_id: payload.provider_event_id,
          event_type: payload.event_type,
          payload: payload,
        });

        const { data: dbPlan } = await supabaseAdmin
          .from('plans')
          .select('id')
          .eq('slug', targetPlan.slug)
          .single();

        const planId = dbPlan?.id || targetPlan.id;

        const { data: dbProfile } = await supabaseAdmin
          .from('profiles')
          .upsert(
            {
              full_name: user.full_name,
              username: user.username,
              email: user.email,
              avatar_url: user.avatar_url,
              is_admin: user.is_admin,
            },
            { onConflict: 'email' }
          )
          .select('id')
          .single();

        const profileId = dbProfile?.id || user.id;

        const { data: dbSub } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: profileId,
            plan_id: planId,
            provider: payload.provider,
            provider_subscription_id: `sub_${payload.provider_payment_id}`,
            status: 'active',
            current_period_start: startDate.toISOString(),
            current_period_end: endDate.toISOString(),
            cancel_at_period_end: false,
          })
          .select('id')
          .single();

        await supabaseAdmin.from('payments').insert({
          user_id: profileId,
          subscription_id: dbSub?.id,
          provider: payload.provider,
          provider_payment_id: payload.provider_payment_id,
          amount_cents: payload.amount_cents,
          currency: 'BRL',
          status: 'paid',
          payment_method: payload.payment_method,
          paid_at: new Date().toISOString(),
          receipt_url: `/app/assinatura/recibo/${payload.provider_payment_id}`,
        });
      } catch (err) {
        console.warn('Supabase sync notice:', err);
      }
    })();
  }

  const session: UserSession = {
    user,
    subscription: updatedSubscription,
    plan: targetPlan,
    hasAccess: true,
  };

  return {
    success: true,
    duplicate: false,
    message: 'Pagamento confirmado e assinatura ativada com sucesso!',
    session,
  };
}

/**
 * Cancel subscription at period end
 */
export function cancelSubscription(userId: string): { success: boolean; message: string } {
  const sub = globalStore.subscriptions.get(userId);
  if (!sub) {
    return { success: false, message: 'Nenhuma assinatura encontrada para este usuário.' };
  }

  sub.cancel_at_period_end = true;
  sub.canceled_at = new Date().toISOString();
  sub.updated_at = new Date().toISOString();
  globalStore.subscriptions.set(userId, sub);

  return {
    success: true,
    message: 'Assinatura cancelada. O acesso permanecerá ativo até o fim do período vigente.',
  };
}

// ============================================================================
// ADMIN METHODS & AGGREGATIONS
// ============================================================================

/**
 * Calculate comprehensive SaaS metrics for the Admin Dashboard
 */
export function getAdminSaaSMetrics(): AdminSaaSMetrics {
  const users = Array.from(globalStore.users.values());
  const subs = Array.from(globalStore.subscriptions.values());
  const payments = globalStore.payments;

  let mrrCents = 0;
  let totalRevenueCents = 0;
  let pixVolumeCents = 0;
  let cardVolumeCents = 0;
  let activeSubscribersCount = 0;
  let canceledCount = 0;
  let pastDueCount = 0;

  // Plan counts map
  const planCountMap: Record<string, { count: number; value: number }> = {};
  for (const plan of globalStore.plans) {
    planCountMap[plan.name] = { count: 0, value: 0 };
  }

  // Calculate MRR from active subscriptions
  for (const sub of subs) {
    if (sub.status === 'active' || sub.status === 'trialing') {
      activeSubscribersCount++;
      const plan = globalStore.plans.find((p) => p.id === sub.plan_id);
      if (plan) {
        if (plan.billing_interval === 'monthly') {
          mrrCents += plan.price_cents;
        } else {
          // Annual normalized to monthly MRR
          mrrCents += Math.round(plan.price_cents / 12);
        }

        if (planCountMap[plan.name]) {
          planCountMap[plan.name].count++;
          planCountMap[plan.name].value += plan.price_cents;
        }
      }
    } else if (sub.status === 'canceled') {
      canceledCount++;
    } else if (sub.status === 'past_due') {
      pastDueCount++;
    }
  }

  // Calculate total payments and payment methods volume
  for (const p of payments) {
    if (p.status === 'paid') {
      totalRevenueCents += p.amount_cents;
      if (p.payment_method === 'pix') {
        pixVolumeCents += p.amount_cents;
      } else {
        cardVolumeCents += p.amount_cents;
      }
    }
  }

  const arrCents = mrrCents * 12;
  const totalUsersCount = users.length;
  const conversionRate = totalUsersCount > 0 ? (activeSubscribersCount / totalUsersCount) * 100 : 0;
  const churnRate = activeSubscribersCount + canceledCount > 0 ? (canceledCount / (activeSubscribersCount + canceledCount)) * 100 : 0;

  // Revenue chart by month (simulated historical projection for visual excellence)
  const revenueChart = [
    { date: 'Jun', mrr: 18500, newRevenue: 12000, subscribers: 380 },
    { date: 'Jul', mrr: 24200, newRevenue: 17400, subscribers: 510 },
    { date: 'Ago', mrr: 29800, newRevenue: 22100, subscribers: 690 },
    { date: 'Set', mrr: 35400, newRevenue: 26800, subscribers: 880 },
    { date: 'Out', mrr: 41200, newRevenue: 31500, subscribers: 1090 },
    { date: 'Nov (Atual)', mrr: Math.round(mrrCents / 100) || 48500, newRevenue: Math.round(totalRevenueCents / 100) || 37900, subscribers: activeSubscribersCount || 1284 },
  ];

  const planDistribution = Object.entries(planCountMap).map(([name, data]) => ({
    name,
    count: data.count,
    value: data.value,
  }));

  return {
    mrrCents,
    arrCents,
    totalRevenueCents,
    totalUsersCount,
    activeSubscribersCount,
    canceledCount,
    pastDueCount,
    conversionRate: Number(conversionRate.toFixed(1)),
    churnRate: Number(churnRate.toFixed(1)),
    pixVolumeCents,
    cardVolumeCents,
    revenueChart,
    planDistribution,
    recentPayments: payments.slice(0, 10),
    recentEvents: globalStore.eventsLog.slice(0, 10),
  };
}

/**
 * Get detailed users list for Admin Table
 */
export function getAdminUsersList(): AdminUserListItem[] {
  const result: AdminUserListItem[] = [];

  for (const user of Array.from(globalStore.users.values())) {
    const sub = globalStore.subscriptions.get(user.id) || null;
    const plan = sub ? globalStore.plans.find((p) => p.id === sub.plan_id) || null : null;
    const userPayments = globalStore.payments.filter((p) => p.user_id === user.id && p.status === 'paid');

    const totalSpentCents = userPayments.reduce((acc, curr) => acc + curr.amount_cents, 0);
    const lastPaymentDate = userPayments[0]?.paid_at || userPayments[0]?.created_at;

    result.push({
      user,
      subscription: sub,
      plan,
      paymentsCount: userPayments.length,
      totalSpentCents,
      lastPaymentDate,
    });
  }

  // Sort by created_at descending
  return result.sort(
    (a, b) => new Date(b.user.created_at).getTime() - new Date(a.user.created_at).getTime()
  );
}

/**
 * Get all payments for Admin Table
 */
export function getAllAdminPayments(): (PaymentRecord & { user?: UserProfile; plan?: Plan })[] {
  return globalStore.payments.map((p) => {
    const user = globalStore.users.get(p.user_id);
    const sub = p.subscription_id
      ? Array.from(globalStore.subscriptions.values()).find((s) => s.id === p.subscription_id)
      : undefined;
    const plan = sub ? globalStore.plans.find((pl) => pl.id === sub.plan_id) : undefined;

    return {
      ...p,
      user,
      plan,
    };
  });
}

/**
 * Get all webhook events
 */
export function getAllAdminWebhookEvents(): WebhookEventRecord[] {
  return globalStore.eventsLog;
}

/**
 * Get all SaaS plans
 */
export function getAllAdminPlans(): Plan[] {
  return globalStore.plans;
}

/**
 * Manually update a user's subscription
 */
export function adminUpdateUserSubscription(
  userId: string,
  params: {
    planSlug?: string;
    status?: Subscription['status'];
    extendMonths?: number;
  }
): { success: boolean; subscription?: Subscription; message: string } {
  const user = globalStore.users.get(userId);
  if (!user) {
    return { success: false, message: 'Usuário não encontrado.' };
  }

  let sub = globalStore.subscriptions.get(userId);
  const now = new Date();

  if (!sub) {
    // Create new manual subscription
    const targetPlan = getPlanBySlug(params.planSlug || 'vice-clipper-pro-annual') || globalStore.plans[1];
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + (params.extendMonths || 12));

    sub = {
      id: `sub_manual_${Date.now()}`,
      user_id: user.id,
      plan_id: targetPlan.id,
      provider: 'simulator',
      provider_customer_id: `cus_admin_${user.id}`,
      provider_subscription_id: `sub_manual_${Date.now()}`,
      status: params.status || 'active',
      current_period_start: now.toISOString(),
      current_period_end: endDate.toISOString(),
      cancel_at_period_end: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
  } else {
    // Update existing subscription
    if (params.planSlug) {
      const plan = getPlanBySlug(params.planSlug);
      if (plan) sub.plan_id = plan.id;
    }
    if (params.status) {
      sub.status = params.status;
    }
    if (params.extendMonths) {
      const currentEnd = new Date(sub.current_period_end).getTime() > now.getTime()
        ? new Date(sub.current_period_end)
        : now;
      currentEnd.setMonth(currentEnd.getMonth() + params.extendMonths);
      sub.current_period_end = currentEnd.toISOString();
    }
    sub.updated_at = now.toISOString();
  }

  globalStore.subscriptions.set(userId, sub);
  return { success: true, subscription: sub, message: 'Assinatura atualizada com sucesso pelo administrador.' };
}

/**
 * Toggle user administrator privileges
 */
export function adminToggleUserAdmin(userId: string, isAdmin: boolean): { success: boolean; user?: UserProfile } {
  const user = globalStore.users.get(userId);
  if (!user) {
    return { success: false };
  }
  user.is_admin = isAdmin;
  globalStore.users.set(userId, user);
  return { success: true, user };
}

/**
 * Update plan settings
 */
export function adminUpdatePlan(
  planId: string,
  updates: Partial<Plan>
): { success: boolean; plan?: Plan; message: string } {
  const index = globalStore.plans.findIndex((p) => p.id === planId);
  if (index === -1) {
    return { success: false, message: 'Plano não encontrado.' };
  }

  globalStore.plans[index] = {
    ...globalStore.plans[index],
    ...updates,
  };

  return { success: true, plan: globalStore.plans[index], message: 'Plano atualizado com sucesso.' };
}
